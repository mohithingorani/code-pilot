FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    ca-certificates \
    gnupg \
    curl \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodejs.org/deb nodecurrent main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y \
    nodejs \
    npm \
    openjdk-17-jdk \
    openjdk-17-jre \
    g++ \
    gdb \
    make \
    git \
    vim \
    nano \
    wget \
    unzip \
    zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g typescript ts-node tsx
RUN pip3 install black flake8 mypy

RUN ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /workspace

CMD ["/bin/bash"]
