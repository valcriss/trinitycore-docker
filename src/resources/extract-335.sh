cd /app/client
/app/server/bin/mapextractor
cp -r Cameras dbc maps /app/server/data

cd /app/client
/app/server/bin/vmap4extractor
mkdir vmaps
/app/server/bin/vmap4assembler Buildings vmaps
cp -r vmaps /app/server/data

cd /app/client
mkdir mmaps
/app/server/bin/mmaps_generator
cp -r mmaps /app/server/data

rm -rf /app/client/Cameras
rm -rf /app/client/dbc
rm -rf /app/client/maps
rm -rf /app/client/gt
rm -rf /app/client/vmaps
rm -rf /app/client/mmaps
rm -rf /app/client/Buildings