rm super.js
cat ../*.js > super.js
java -jar yuicompressor-2.4.8.jar super.js -o super-min.js --charset utf-8
cat banner.txt  | cat - super-min.js > temp && mv temp super-min.js
