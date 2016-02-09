# tvShowCopy
Copy tv shows from one folder to a sorted folder.

run: node tvcopy -s /downloads/ -d /tvshows -e .mkv.avi.mpg

help: node tvcopy -h

crontab example:
*/10 * * * * /usr/local/bin/node /tvShowCopy/tvcopy.js -s /downloads -d /tvshows -e .avi.mkv.mpg> /mnt/tvShowCopy/tvcopy.log
