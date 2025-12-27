#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

void output_json(const char *key, const char *value)
{
    printf("{\"%s\":%s}\n", key, value);
}

void output_json_bool(const char *key, int bool_value)
{
    printf("{\"%s\":%s}\n", key, bool_value ? "true" : "false");
}

void output_json_int(const char *key, int int_value)
{
    printf("{\"%s\":%d}\n", key, int_value);
}



int get_vk_code(const char *key)
{
    if (strlen(key) == 1)
    {
        char c = key[0];
        if (c >= 'a' && c <= 'z')
            c -= 32;
        return VkKeyScan(c);
    }

    if (strcmp(key, "enter") == 0)
        return VK_RETURN;
    if (strcmp(key, "shift") == 0)
        return VK_SHIFT;
    if (strcmp(key, "ctrl") == 0)
        return VK_CONTROL;
    if (strcmp(key, "alt") == 0)
        return VK_MENU;
    if (strcmp(key, "tab") == 0)
        return VK_TAB;
    if (strcmp(key, "esc") == 0)
        return VK_ESCAPE;
    if (strcmp(key, "space") == 0)
        return VK_SPACE;
    if (strcmp(key, "backspace") == 0)
        return VK_BACK;
    if (strcmp(key, "up") == 0)
        return VK_UP;
    if (strcmp(key, "down") == 0)
        return VK_DOWN;
    if (strcmp(key, "left") == 0)
        return VK_LEFT;
    if (strcmp(key, "right") == 0)
        return VK_RIGHT;
    if (strcmp(key, "delete") == 0)
        return VK_DELETE;
    if (strcmp(key, "home") == 0)
        return VK_HOME;
    if (strcmp(key, "end") == 0)
        return VK_END;
    if (strcmp(key, "f1") == 0)
        return VK_F1;
    if (strcmp(key, "f2") == 0)
        return VK_F2;
    if (strcmp(key, "f3") == 0)
        return VK_F3;
    if (strcmp(key, "f4") == 0)
        return VK_F4;
    if (strcmp(key, "f5") == 0)
        return VK_F5;
    if (strcmp(key, "f6") == 0)
        return VK_F6;
    if (strcmp(key, "f7") == 0)
        return VK_F7;
    if (strcmp(key, "f8") == 0)
        return VK_F8;
    if (strcmp(key, "f9") == 0)
        return VK_F9;
    if (strcmp(key, "f10") == 0)
        return VK_F10;
    if (strcmp(key, "f11") == 0)
        return VK_F11;
    if (strcmp(key, "f12") == 0)
        return VK_F12;

    return -1;
}

int press_key(const char *key)
{
    int vk = get_vk_code(key);
    if (vk == -1)
        return 0;
    keybd_event(vk, 0, 0, 0);
    return 1;
}

int release_key(const char *key)
{
    int vk = get_vk_code(key);
    if (vk == -1)
        return 0;
    keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);
    return 1;
}

int type_text(const char *text)
{
    for (size_t i = 0; i < strlen(text); i++)
    {
        SHORT vk = VkKeyScan(text[i]);
        if (vk == -1)
            continue;
        keybd_event((BYTE)vk, 0, 0, 0);
        keybd_event((BYTE)vk, 0, KEYEVENTF_KEYUP, 0);
        Sleep(10);
    }
    return 1;
}

int repeat_key(const char *key, int count)
{
    int vk = get_vk_code(key);
    if (vk == -1)
        return 0;
    for (int i = 0; i < count; i++)
    {
        keybd_event(vk, 0, 0, 0);
        keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);
        Sleep(50);
    }
    return 1;
}

int is_key_down(const char *key)
{
    int vk = get_vk_code(key);
    if (vk == -1)
        return 0;
    return (GetAsyncKeyState(vk) & 0x8000) != 0;
}

void print_help() 
{
    printf("{\"help\":{");
    printf("\"press\":\"press <key>\",");
    printf("\"release\":\"release <key>\",");
    printf("\"type\":\"type <text>\",");
    printf("\"iskeydown\":\"iskeydown <key>\",");
    printf("\"repeat\":\"repeat <key> <count>\",");
    printf("\"keys\":\"enter, shift, ctrl, alt, tab, esc, space, backspace, arrows, f1-f12, a-z\"");
    printf("}}\n");
    fflush(stdout);
}

int main(int argc, char *argv[])
{
    if (argc < 2 || strcmp(argv[1], "help") == 0)
    {
        print_help();
        return 0;
    }

    if (strcmp(argv[1], "press") == 0 && argc == 3)
        output_json_bool("success", press_key(argv[2]));
    else if (strcmp(argv[1], "release") == 0 && argc == 3)
        output_json_bool("success", release_key(argv[2]));
    else if (strcmp(argv[1], "type") == 0 && argc == 3)
        output_json_bool("success", type_text(argv[2]));
    else if (strcmp(argv[1], "iskeydown") == 0 && argc == 3)
        output_json_bool("keydown", is_key_down(argv[2]));
    else if (strcmp(argv[1], "repeat") == 0 && argc == 4)
        output_json_bool("success", repeat_key(argv[2], atoi(argv[3])));
    else
        output_json_bool("error", 1);

    return 0;
}
