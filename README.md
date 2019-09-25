Range Split Proxy

- Workaround for slow doanlod problem in https://github.com/hi-ogawa/podcastify

```
# Example
$ URL="https://podcastify.hiogawa.now.sh/enclosure?videoUrl=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DIPS8jTWya8Y"
$ PROXY_URL="http://localhost:8080/?url=$(echo $URL | jq -rR '@uri')"
$ curl -L $URL > out1
$ curl -L $PROXY_URL > out2

$ PROXY_URL="https://range-split-proxy.herokuapp.com/?url=$(echo $URL | jq -rR '@uri')"
$ curl -L $PROXY_URL > out2
```


Something similar using curl

```bash
# e.g. curl_range https://github.com/mozilla/DeepSpeech/releases/download/v0.5.1/deepspeech-0.5.1-models.tar.gz > out.tar.gz
function curl_range() {
  local URL="${1}"
  local CHUNK_SIZE="${2:-(( 2 ** 22 ))}" # default 4MiB

  echo ':: Check if server supports "range" header...' 1>&2
  # NOTE: HEAD request is forbidden for some content server, so use GET request with "empty range" here.
  local WHOLE_SIZE=$(\
      curl -i -L -H 'range: bytes=0-0' "${URL}" 2>/dev/null | \
      ruby -ne 'm = $_.strip.match(/Content-Range: bytes 0-0\/(.*)/); puts m[1] if m')

  if test -z "${WHOLE_SIZE}"; then
    echo ':: "range" header is not supported.' 1>&2
    exit 1
  else
    echo ":: Available range is: ${WHOLE_SIZE}"  1>&2
    echo ":: Starting request..."  1>&2
    local NUM_LOOPS=$(( "${WHOLE_SIZE}" / "${CHUNK_SIZE}" ))
    local START
    local END
    for (( i=0; i<=$NUM_LOOPS; i++ )); do
      START=$(( $i * $CHUNK_SIZE ))
      END=$(( ($i + 1) * $CHUNK_SIZE - 1 ))
      echo ":: Request ${START}-${END} ::"  1>&2
      curl -L -H "range: bytes=${START}-${END}" "${URL}"
      echo 1>&2
    done
  fi
}
```


References

- `cancellableProgressDownloadRangeRequestObserver` in https://github.com/hi-ogawa/youtube-audio-offline/blob/master/src/utils.js
