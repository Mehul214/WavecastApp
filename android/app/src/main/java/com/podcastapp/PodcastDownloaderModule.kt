package com.podcastapp

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.Request
import okhttp3.Response
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@ReactModule(name = PodcastDownloaderModule.NAME)
class PodcastDownloaderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "PodcastDownloader"
        private const val BROWSER_USER_AGENT =
            "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    }

    private val executor = Executors.newFixedThreadPool(2)
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun getName(): String = NAME

    private fun getDownloadsDir(): File {
        val dir = File(reactContext.filesDir, "podcasts")
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }

    private fun sanitizeFileName(id: String): String {
        return id.replace(Regex("[^a-zA-Z0-9._-]"), "_") + ".mp3"
    }

    @ReactMethod
    fun downloadEpisode(episodeId: String, downloadUrl: String, promise: Promise) {
        executor.execute {
            var response: Response? = null
            var inputStream: InputStream? = null
            var outputStream: FileOutputStream? = null

            try {
                val dir = getDownloadsDir()
                val targetFile = File(dir, sanitizeFileName(episodeId))
                val tempFile = File(dir, sanitizeFileName(episodeId) + ".tmp")

                if (tempFile.exists()) {
                    tempFile.delete()
                }

                val client = OkHttpClientProvider.getOkHttpClient().newBuilder()
                    .followRedirects(true)
                    .followSslRedirects(true)
                    .retryOnConnectionFailure(true)
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(60, TimeUnit.SECONDS)
                    .build()

                val request = Request.Builder()
                    .url(downloadUrl)
                    .header("User-Agent", BROWSER_USER_AGENT)
                    .header("Accept", "audio/*, */*")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Connection", "keep-alive")
                    .build()

                response = client.newCall(request).execute()

                if (!response.isSuccessful) {
                    mainHandler.post {
                        promise.reject("DOWNLOAD_ERROR", "Server returned HTTP ${response.code}")
                    }
                    return@execute
                }

                val body = response.body
                if (body == null) {
                    mainHandler.post {
                        promise.reject("DOWNLOAD_ERROR", "Response body is empty")
                    }
                    return@execute
                }

                val contentLength = body.contentLength()
                inputStream = body.byteStream()
                outputStream = FileOutputStream(tempFile)

                val buffer = ByteArray(16384)
                var bytesRead: Int
                var totalBytesRead = 0L
                var lastProgressTime = 0L

                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                    totalBytesRead += bytesRead

                    val now = System.currentTimeMillis()
                    if (now - lastProgressTime > 250) {
                        lastProgressTime = now
                        val progressPercent = if (contentLength > 0) {
                            (totalBytesRead.toDouble() / contentLength.toDouble() * 100).toInt()
                        } else {
                            -1
                        }

                        val params = Arguments.createMap().apply {
                            putString("episodeId", episodeId)
                            putInt("progress", progressPercent)
                            putDouble("bytesRead", totalBytesRead.toDouble())
                            putDouble("totalBytes", contentLength.toDouble())
                        }
                        sendEvent("onDownloadProgress", params)
                    }
                }

                outputStream.flush()
                outputStream.close()
                outputStream = null

                if (targetFile.exists()) {
                    targetFile.delete()
                }
                tempFile.renameTo(targetFile)

                val result = Arguments.createMap().apply {
                    putString("episodeId", episodeId)
                    putString("localPath", targetFile.absolutePath)
                    putDouble("fileSize", targetFile.length().toDouble())
                }

                mainHandler.post {
                    promise.resolve(result)
                }

            } catch (e: Exception) {
                mainHandler.post {
                    promise.reject("DOWNLOAD_FAILED", e.message, e)
                }
            } finally {
                try {
                    inputStream?.close()
                    outputStream?.close()
                    response?.close()
                } catch (ignored: Exception) {}
            }
        }
    }

    @ReactMethod
    fun deleteEpisode(episodeId: String, promise: Promise) {
        try {
            val file = File(getDownloadsDir(), sanitizeFileName(episodeId))
            val deleted = if (file.exists()) file.delete() else true
            promise.resolve(deleted)
        } catch (e: Exception) {
            promise.reject("DELETE_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun getDownloadedEpisodes(promise: Promise) {
        try {
            val dir = getDownloadsDir()
            val files = dir.listFiles()
            val array = Arguments.createArray()
            files?.filter { it.extension == "mp3" }?.forEach { f ->
                val map = Arguments.createMap().apply {
                    putString("fileName", f.name)
                    putString("localPath", f.absolutePath)
                    putDouble("fileSize", f.length().toDouble())
                }
                array.pushMap(map)
            }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("LIST_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun isEpisodeDownloaded(episodeId: String, promise: Promise) {
        val file = File(getDownloadsDir(), sanitizeFileName(episodeId))
        promise.resolve(file.exists() && file.length() > 0)
    }

    @ReactMethod
    fun getLocalFilePath(episodeId: String, promise: Promise) {
        val file = File(getDownloadsDir(), sanitizeFileName(episodeId))
        if (file.exists() && file.length() > 0) {
            promise.resolve(file.absolutePath)
        } else {
            promise.resolve(null)
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native NativeEventEmitter
    }
}
