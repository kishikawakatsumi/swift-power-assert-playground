FROM swiftdocker/swift

RUN git clone https://github.com/kishikawakatsumi/SwiftPowerAssert.git tool && cd tool && swift build -c release
