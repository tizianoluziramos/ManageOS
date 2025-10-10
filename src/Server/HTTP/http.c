#include <winsock2.h>
#include <windows.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <dirent.h>

#pragma comment(lib, "ws2_32.lib")

#define BUF_SIZE 8192

typedef struct
{
    int port;
    char folder[MAX_PATH];
    char **blocked_ext;
    int blocked_count;
} ServerConfig;

ServerConfig config;

void send_response(SOCKET client, const char *content, const char *type, int length)
{
    char header[BUF_SIZE];
    snprintf(header, sizeof(header),
             "HTTP/1.1 200 OK\r\n"
             "Content-Type: %s\r\n"
             "Content-Length: %d\r\n"
             "Connection: close\r\n"
             "\r\n",
             type, length);
    send(client, header, (int)strlen(header), 0);
    send(client, content, length, 0);
}

void send_error(SOCKET client, int code)
{
    char resp[64];
    snprintf(resp, sizeof(resp), "{\"status\":false,\"code\":%d}", code);
    send_response(client, resp, "application/json", (int)strlen(resp));
}

int has_blocked_extension(const char *filename)
{
    if (config.blocked_count == 0)
        return 0;
    const char *ext = strrchr(filename, '.');
    if (!ext)
        return 0;
    for (int i = 0; i < config.blocked_count; i++)
    {
        if (_stricmp(ext, config.blocked_ext[i]) == 0)
            return 1;
    }
    return 0;
}

void list_folder(const char *path, char *output, size_t size)
{
    DIR *dir;
    struct dirent *entry;
    int first = 1;
    snprintf(output, size, "{\"status\":true,\"data\":[");
    dir = opendir(path);
    if (!dir)
    {
        snprintf(output, size, "{\"status\":false,\"data\":[]}");
        return;
    }
    while ((entry = readdir(dir)) != NULL)
    {
        if (entry->d_type != DT_REG && entry->d_type != DT_DIR)
            continue;
        if (has_blocked_extension(entry->d_name))
            continue;
        if (!first)
            strncat(output, ",", size - strlen(output) - 1);
        strncat(output, "\"", size - strlen(output) - 1);
        strncat(output, entry->d_name, size - strlen(output) - 1);
        strncat(output, "\"", size - strlen(output) - 1);
        first = 0;
    }
    closedir(dir);
    strncat(output, "]}", size - strlen(output) - 1);
}

const char *get_content_type(const char *filename)
{
    const char *ext = strrchr(filename, '.');
    if (!ext)
        return "application/octet-stream";

    if (_stricmp(ext, ".html") == 0)
        return "text/html";
    if (_stricmp(ext, ".css") == 0)
        return "text/css";
    if (_stricmp(ext, ".js") == 0)
        return "application/javascript";
    if (_stricmp(ext, ".json") == 0)
        return "application/json";
    if (_stricmp(ext, ".png") == 0)
        return "image/png";
    if (_stricmp(ext, ".jpg") == 0 || _stricmp(ext, ".jpeg") == 0)
        return "image/jpeg";
    if (_stricmp(ext, ".gif") == 0)
        return "image/gif";
    return "application/octet-stream";
}

void send_file(SOCKET client, const char *filepath)
{
    FILE *f = fopen(filepath, "rb");
    if (!f)
    {
        send_error(client, 404);
        return;
    }

    fseek(f, 0, SEEK_END);
    long length = ftell(f);
    rewind(f);

    char *buffer = malloc(length);
    if (!buffer)
    {
        fclose(f);
        send_error(client, 500);
        return;
    }

    fread(buffer, 1, length, f);
    fclose(f);

    const char *type = get_content_type(filepath);
    send_response(client, buffer, type, (int)length);

    free(buffer);
}

int start_server()
{
    WSADATA w;
    SOCKET server, client;
    struct sockaddr_in addr, caddr;
    int addrlen = sizeof(caddr);

    if (WSAStartup(MAKEWORD(2, 2), &w))
        return 0;

    server = socket(AF_INET, SOCK_STREAM, 0);
    if (server == INVALID_SOCKET)
        return 0;

    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(config.port);

    if (bind(server, (struct sockaddr *)&addr, sizeof(addr)))
        return 0;
    if (listen(server, 5))
        return 0;

    while ((client = accept(server, (struct sockaddr *)&caddr, &addrlen)) != INVALID_SOCKET)
    {
        char req[BUF_SIZE];
        int r = recv(client, req, BUF_SIZE - 1, 0);
        if (r > 0)
            req[r] = 0;

        char method[8], path[512];
        sscanf(req, "%s %s", method, path);

        if (path[0] == '/')
            memmove(path, path + 1, strlen(path));

        char full_path[MAX_PATH];
        snprintf(full_path, sizeof(full_path), "%s\\%s", config.folder, path);

        if (strlen(path) == 0 || path[strlen(path) - 1] == '\\')
        {
            char json[BUF_SIZE];
            list_folder(config.folder, json, sizeof(json));
            send_response(client, json, "application/json", (int)strlen(json));
        }
        else
        {
            if (has_blocked_extension(path))
            {
                send_error(client, 403);
            }
            else
            {
                send_file(client, full_path);
            }
        }
        closesocket(client);
    }

    closesocket(server);
    WSACleanup();
    return 1;
}

int main(int argc, char *argv[])
{
    if (argc < 3)
        return 0;

    config.port = atoi(argv[1]);
    strncpy(config.folder, argv[2], sizeof(config.folder) - 1);

    // blocked extensions
    config.blocked_count = argc - 3;
    config.blocked_ext = &argv[3];

    if (start_server())
    {
        printf("{\"status\":true}\n");
        return 0;
    }
    else
    {
        printf("{\"status\":false}\n");
        return 1;
    }
}
