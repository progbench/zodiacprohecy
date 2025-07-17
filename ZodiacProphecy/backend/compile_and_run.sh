
#!/bin/bash
echo "Compiling and running Zodiac Prophecy Server..."
echo

cd backend
javac ZodiacServer.java
if [ $? -ne 0 ]; then
    echo "Compilation failed!"
    exit 1
fi

echo "Compilation successful!"
echo "Starting server..."
echo
java ZodiacServer
