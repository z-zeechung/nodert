call "D:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
cd libqjs
cmake ../quickjs
cmake --build . --config Release