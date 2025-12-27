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

void output_json_array(const char *key, int a, int b)
{
    printf("{\"%s\":[%d,%d]}\n", key, a, b);
}

int move_mouse(int x, int y)
{
    return SetCursorPos(x, y);
}

int click_mouse(const char *button)
{
    if (strcmp(button, "left") == 0)
    {
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
        return 1;
    }
    else if (strcmp(button, "right") == 0)
    {
        mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
        mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
        return 1;
    }
    return 0;
}

int double_click()
{
    click_mouse("left");
    Sleep(50);
    click_mouse("left");
    return 1;
}

int drag_mouse(int startX, int startY, int endX, int endY)
{
    SetCursorPos(startX, startY);
    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    Sleep(100);
    SetCursorPos(endX, endY);
    Sleep(100);
    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    return 1;
}

int scroll_mouse(int amount)
{
    mouse_event(MOUSEEVENTF_WHEEL, 0, 0, amount, 0);
    return 1;
}

int get_position()
{
    POINT p;
    if (GetCursorPos(&p))
    {
        output_json_array("position", p.x, p.y);
        return 1;
    }
    return 0;
}

int track_position()
{
    POINT p;
    printf("[");
    while (1)
    {
        if (GetCursorPos(&p))
        {
            printf("[%d,%d],", p.x, p.y);
            fflush(stdout);
        }
        Sleep(100);
    }
    printf("]");
    return 1;
}

int set_speed(int speed)
{
    return SystemParametersInfo(SPI_SETMOUSESPEED, 0, (PVOID)(LONG_PTR)speed, 0);
}

int hide_cursor()
{
    while (ShowCursor(FALSE) >= 0)
        ;
    return 1;
}

int show_cursor()
{
    while (ShowCursor(TRUE) < 0)
        ;
    return 1;
}

int middle_click()
{
    mouse_event(MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, 0);
    mouse_event(MOUSEEVENTF_MIDDLEUP, 0, 0, 0, 0);
    return 1;
}

int click_down(const char *button)
{
    if (strcmp(button, "left") == 0)
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    else if (strcmp(button, "right") == 0)
        mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
    else
        return 0;
    return 1;
}

int click_up(const char *button)
{
    if (strcmp(button, "left") == 0)
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    else if (strcmp(button, "right") == 0)
        mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
    else
        return 0;
    return 1;
}

int swap_buttons()
{
    return SwapMouseButton(TRUE);
}

int restore_buttons()
{
    return SwapMouseButton(FALSE);
}

int get_button_state()
{
    int left = GetAsyncKeyState(VK_LBUTTON) & 0x8000 ? 1 : 0;
    int right = GetAsyncKeyState(VK_RBUTTON) & 0x8000 ? 1 : 0;
    printf("{\"buttons\":[{\"left\":%d},{\"right\":%d}]}\n", left, right);
    return 1;
}

int enable_mouse()
{
    BlockInput(FALSE);
    return 1;
}

int disable_mouse()
{
    BlockInput(TRUE);
    return 1;
}

int repeat_click(const char *button, int count)
{
    for (int i = 0; i < count; i++)
    {
        click_mouse(button);
        Sleep(100);
    }
    return 1;
}

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        output_json_bool("error", 1);
        return 1;
    }

    if (strcmp(argv[1], "move") == 0 && argc == 4)
        output_json_bool("success", move_mouse(atoi(argv[2]), atoi(argv[3])));
    else if (strcmp(argv[1], "click") == 0 && argc == 3)
        output_json_bool("success", click_mouse(argv[2]));
    else if (strcmp(argv[1], "doubleclick") == 0)
        output_json_bool("success", double_click());
    else if (strcmp(argv[1], "drag") == 0 && argc == 6)
        output_json_bool("success", drag_mouse(atoi(argv[2]), atoi(argv[3]), atoi(argv[4]), atoi(argv[5])));
    else if (strcmp(argv[1], "scroll") == 0 && argc == 3)
        output_json_bool("success", scroll_mouse(atoi(argv[2])));
    else if (strcmp(argv[1], "position") == 0)
        get_position();
    else if (strcmp(argv[1], "track") == 0)
        track_position();
    else if (strcmp(argv[1], "speed") == 0 && argc == 3)
        output_json_bool("success", set_speed(atoi(argv[2])));
    else if (strcmp(argv[1], "hide") == 0)
        output_json_bool("success", hide_cursor());
    else if (strcmp(argv[1], "show") == 0)
        output_json_bool("success", show_cursor());
    else if (strcmp(argv[1], "middleclick") == 0)
        output_json_bool("success", middle_click());
    else if (strcmp(argv[1], "clickdown") == 0 && argc == 3)
        output_json_bool("success", click_down(argv[2]));
    else if (strcmp(argv[1], "clickup") == 0 && argc == 3)
        output_json_bool("success", click_up(argv[2]));
    else if (strcmp(argv[1], "swapbuttons") == 0)
        output_json_bool("success", swap_buttons());
    else if (strcmp(argv[1], "restorebuttons") == 0)
        output_json_bool("success", restore_buttons());
    else if (strcmp(argv[1], "getbuttonstate") == 0)
        get_button_state();
    else if (strcmp(argv[1], "enablemouse") == 0)
        output_json_bool("success", enable_mouse());
    else if (strcmp(argv[1], "disablemouse") == 0)
        output_json_bool("success", disable_mouse());
    else if (strcmp(argv[1], "repeatclick") == 0 && argc == 4)
        output_json_bool("success", repeat_click(argv[2], atoi(argv[3])));
    else
        output_json_bool("error", 1);

    return 0;
}
