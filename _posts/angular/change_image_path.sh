
for file in "$@"
do 
    perl -i'.bak' -p -e 's/img\/(u.*png)/\/assets\/img\/angular\/$1/g' $file;
done
