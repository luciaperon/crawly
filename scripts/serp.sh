echo
echo "Using type: $type"
echo "Using Input File Path: $inputFilepath"
echo "Using Column Name: $columnName"
echo "Using Number Of Results: $numberOfResults"
echo "Using Location: $location"
echo "Using Output Filename: $outputFilename"

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
echo "Starting SERP Search process..."

echo
npx ts-node src/Services/SERP/SERPBatchExtractor.ts "$type" $inputFilepath "$columnName" $numberOfResults "$location" "$outputFilename"