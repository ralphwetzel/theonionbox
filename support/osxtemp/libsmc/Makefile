CC        = cc
CFLAGS     = -mmacosx-version-min=10.6 -std=c99 -arch x86_64 -O2
FRAMEWORKS = -framework IOKit
SRC        = src/*.c
OBJ        = libsmc.o
LIB        = libsmc.a
LIB_DY     = libsmc.dylib

static:
	${CC} ${CFLAGS} -c -o ${OBJ} ${SRC}
	libtool -static -o ${LIB} ${OBJ}

dynamic:
	${CC} ${CFLAGS} ${FRAMEWORKS} -dynamiclib -o ${LIB_DY} ${SRC}

clean: 
	rm *.o *.a *.dylib


