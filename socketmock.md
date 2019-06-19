
# Mocking sockets

```c
#include <stdio.h>
#include <string.h>

#define MOCK_SOCKET_SIZE 10
char s_socketBuffer[MOCK_SOCKET_SIZE];
char *pSend = s_socketBuffer;
char *pReceive = s_socketBuffer;

int recv(int sockfd, void *buf, size_t len, int flags)
{
  size_t size = pSend - pReceive;
  size_t smaller = len < size ? len : size;

  strncpy((char*)buf, pReceive, smaller);
  pReceive += smaller;
  pSend = s_socketBuffer;//reset
  return smaller;
}

int send(int sockfd, const void *buf0, size_t len, int flags)
{
  size_t size = (s_socketBuffer + MOCK_SOCKET_SIZE) - pSend;
  size_t smaller = len < size ? len : size;
  strncpy(pSend, (char*)buf0, smaller);
  pSend += smaller;
  pReceive = s_socketBuffer;//reset
  return smaller;
}

void Client(int socket)
{
  send(socket, "hi", 2, 0);
}

void Server(int socket)
{
  char buf[10];
  int i = recv(socket, buf, 10, 0);
}

int main()
{
  int socket = 0;//mock
  Client(socket);
  Server(socket);
}

```

