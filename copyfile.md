# Copy file

```cpp


int copy_file(const char* pathfrom,
              const char* pathto)
{
    char buf[4096];
    size_t nread;
    int saved_errno;

    FILE * fd_from = fopen(pathfrom, "rb");
    if (fd_from < 0)
        return -1;

    FILE* fd_to = fopen(pathto, "wb");
    if (fd_to < 0)
        goto out_error;

    while (nread = fread(buf, sizeof(char), sizeof buf, fd_from), nread > 0)
    {
        char* out_ptr = buf;
        size_t nwritten;

        do
        {
            nwritten = fwrite(out_ptr, sizeof(char), nread, fd_to);

            if (nwritten >= 0)
            {
                nread -= nwritten;
                out_ptr += nwritten;
            }
            else
            {
                goto out_error;
            }
        }
        while (nread > 0);
    }

    if (nread == 0)
    {
        if (fclose(fd_to) < 0)
        {
            fd_to = NULL;
            goto out_error;
        }
        fclose(fd_from);

        /* Success! */
        return 0;
    }

out_error:
    saved_errno = errno;
    
    fclose(fd_from);

    if (fd_to != NULL)
        fclose(fd_to);
    
    return saved_errno;
}

```

