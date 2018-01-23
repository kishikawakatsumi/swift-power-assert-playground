#!/bin/bash

exec 1> "/usercode/log"
exec 2> "/usercode/errors"

echo "Swift Power Assert version `tool/.build/release/swift-power-assert --version`"

swift --driver-mode=swiftc /usercode/main.swift
if [ $? -eq 0 ];	then
	tool/.build/release/swift-power-assert transform /usercode/main.swift
	if [ $? -eq 0 ];	then
		swift --driver-mode=swiftc /usercode/main.swift /usercode/Utilities.swift -o /usercode/main.o
		if [ $? -eq 0 ];	then
			/usercode/main.o
		else
		  echo "Compilation(2) failed."
		fi
	else
		echo "Instrulmentation failed."
	fi
else
	echo "Compilation(1) failed."
fi

mv /usercode/log /usercode/completed
