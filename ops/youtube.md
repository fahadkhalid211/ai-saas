# YouTube links in the knowledge base

Adding a YouTube link reads the video's captions (or, for a video without captions, up to the first minute or two of its audio, which
needs a connected Groq or Gemini key). It works on a normal internet connection. On a **cloud host** (Vercel, AWS, Oracle) YouTube
often refuses the server's address ("sign in to confirm you're not a bot"), and then no transcript can be read, whatever the video is.

The error now says which of three things happened, so it is no longer "may contain only music":

| Message starts with | Meaning | What the person is told |
|---|---|---|
| "YouTube is refusing to let our server read this video" | YouTube turned the server away (bot check, sign-in wall, no answer, or captions listed but not downloadable) | Copy the transcript from YouTube ("Show transcript") into a text document, or upload the video/audio file, or try later |
| "This YouTube video cannot be read: YouTube reports it as ..." | Private, removed, age-restricted, members-only or region-locked | Make it public and add the link again |
| "This YouTube video (...) has no captions or subtitles we can read" | YouTube answered fine; the video simply has no captions | Turn on captions, or upload the audio |

## Making it work on a cloud host

Set **`YOUTUBE_PROXY_URL`** to an HTTP(S) proxy that YouTube accepts (a residential or rotating proxy is the reliable kind):

```
YOUTUBE_PROXY_URL=http://username:password@proxy.example.com:8080
```

Every YouTube request (the watch page, the player API, the caption files and the audio) goes through that proxy with a CONNECT tunnel;
the proxy sees only the host names. Nothing else in the app uses it. Remove the variable to go back to direct requests.

Optional: **`YOUTUBE_TRANSCRIPT_API_KEY`** is a free key from youtube-transcript.ai (10 videos a day). When set, that service is asked first;
it runs on its own rotating infrastructure and is not blocked. Without the key it is not called (it answers 401 without one).

Watch the server log for `[URLExtractor] No transcript for <id>: ...`, which records the exact verdict YouTube gave.
