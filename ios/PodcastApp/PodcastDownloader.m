#import "PodcastDownloader.h"

@implementation PodcastDownloader

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onDownloadProgress"];
}

- (NSString *)getDownloadsDir {
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths firstObject];
  NSString *downloadsDir = [documentsDirectory stringByAppendingPathComponent:@"podcasts"];
  if (![[NSFileManager defaultManager] fileExistsAtPath:downloadsDir]) {
    [[NSFileManager defaultManager] createDirectoryAtPath:downloadsDir withIntermediateDirectories:YES attributes:nil error:nil];
  }
  return downloadsDir;
}

- (NSString *)sanitizeFileName:(NSString *)episodeId {
  NSCharacterSet *illegalChars = [[NSCharacterSet alphanumericCharacterSet] invertedSet];
  NSString *safeName = [[episodeId componentsSeparatedByCharactersInSet:illegalChars] componentsJoinedByString:@"_"];
  return [safeName stringByAppendingString:@".mp3"];
}

RCT_EXPORT_METHOD(downloadEpisode:(NSString *)episodeId
                  downloadUrl:(NSString *)downloadUrl
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSURL *url = [NSURL URLWithString:downloadUrl];
  if (!url) {
    reject(@"INVALID_URL", @"The provided URL is invalid.", nil);
    return;
  }

  NSString *downloadsDir = [self getDownloadsDir];
  NSString *fileName = [self sanitizeFileName:episodeId];
  NSString *destinationPath = [downloadsDir stringByAppendingPathComponent:fileName];
  NSURL *destinationUrl = [NSURL fileURLWithPath:destinationPath];

  NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
  NSURLSession *session = [NSURLSession sessionWithConfiguration:config];

  NSURLSessionDownloadTask *task = [session downloadTaskWithURL:url completionHandler:^(NSURL *location, NSURLResponse *response, NSError *error) {
    if (error) {
      reject(@"DOWNLOAD_FAILED", error.localizedDescription, error);
      return;
    }

    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
    if (httpResponse.statusCode != 200) {
      reject(@"DOWNLOAD_ERROR", [NSString stringWithFormat:@"Server returned %ld", (long)httpResponse.statusCode], nil);
      return;
    }

    NSFileManager *fileManager = [NSFileManager defaultManager];
    if ([fileManager fileExistsAtPath:destinationPath]) {
      [fileManager removeItemAtPath:destinationPath error:nil];
    }

    NSError *moveError = nil;
    [fileManager moveItemAtURL:location toURL:destinationUrl error:&moveError];
    if (moveError) {
      reject(@"FILE_MOVE_FAILED", moveError.localizedDescription, moveError);
      return;
    }

    NSDictionary *attrs = [fileManager attributesOfItemAtPath:destinationPath error:nil];
    unsigned long long fileSize = [attrs fileSize];

    resolve(@{
      @"episodeId": episodeId,
      @"localPath": destinationPath,
      @"fileSize": @(fileSize)
    });
  }];

  [task resume];
}

RCT_EXPORT_METHOD(deleteEpisode:(NSString *)episodeId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *downloadsDir = [self getDownloadsDir];
  NSString *fileName = [self sanitizeFileName:episodeId];
  NSString *destinationPath = [downloadsDir stringByAppendingPathComponent:fileName];

  NSFileManager *fileManager = [NSFileManager defaultManager];
  if ([fileManager fileExistsAtPath:destinationPath]) {
    NSError *error = nil;
    BOOL deleted = [fileManager removeItemAtPath:destinationPath error:&error];
    if (error) {
      reject(@"DELETE_FAILED", error.localizedDescription, error);
      return;
    }
    resolve(@(deleted));
  } else {
    resolve(@YES);
  }
}

RCT_EXPORT_METHOD(isEpisodeDownloaded:(NSString *)episodeId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *downloadsDir = [self getDownloadsDir];
  NSString *fileName = [self sanitizeFileName:episodeId];
  NSString *destinationPath = [downloadsDir stringByAppendingPathComponent:fileName];
  BOOL exists = [[NSFileManager defaultManager] fileExistsAtPath:destinationPath];
  resolve(@(exists));
}

RCT_EXPORT_METHOD(getLocalFilePath:(NSString *)episodeId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *downloadsDir = [self getDownloadsDir];
  NSString *fileName = [self sanitizeFileName:episodeId];
  NSString *destinationPath = [downloadsDir stringByAppendingPathComponent:fileName];
  if ([[NSFileManager defaultManager] fileExistsAtPath:destinationPath]) {
    resolve(destinationPath);
  } else {
    resolve([NSNull null]);
  }
}

@end
