# Codenow
 remote code execution engine and testcase functionalities
---

### Machine Requirements
- it should have docker up and running
- nodjs 
- npm
- port `5672`, `3010` are available
- pull docker images- node, gcc, python, openjdk
```bash
docker pull node
docker pull gcc
docker pull python
docker pull openjdk
```


## Setting Up The Project
- clone the repo and go inside the clone folder
- Open the terminal and run rabbitmq on port 5672
```bash
docker run -p 5672:5672 rabbitmq
```
- go to the server directory and install packages
```bash
cd server && npm i
```
- run the server
```bash
node index.js
```
- go to the client directory and install packages
```bash
cd /client/vite-project && npm i
```
- run the client server
```bash
npm run dev
```
## 🗒️ References
- [Docker](https://www.docker.com/)
- [RabbitMQ](https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html)
- [Leetcode code execution system design](https://medium.com/@yashbudukh/building-a-remote-code-execution-system-9e55c5b248d6)
- [Run client code](https://github.com/amitanshusahu/node-containerized-execution-env)
