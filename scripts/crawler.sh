echo
echo "Is Cache Run? $cache" 
echo "Using URL: $url"
echo "Using Crawl Depth: $crawlDepth"
echo "Using body: $body"
echo "Using outputFilename: $outputFilename"
echo "Using includeInternal: $includeInternal"

if [ "$cache" = true ];
then
    echo "Using outputDirname:" $outputDirname
fi

echo 
echo "Changing root directory..."
cd /home/almir_mulalic_am_gmail_com/crawly

echo
echo "Exporting environment variables..."
export $(xargs < .env)

echo
echo "Checking node version (should be v16.17.1)"
echo $(node -v)

echo
echo "Starting Crawler process..."

echo
npx ts-node src/Services/Crawler/Crawler.ts "$url" $crawlDepth "$outputFilename" $includeInternal "$body" "$outputDirname"