# flyscrape-action
Run [Flyscrape](https://github.com/philippta/flyscrape) scripts using Github
Actions.

# Usage
```yaml
- uses: MrFlynn/flyscrape-action@v1
  id: run-flyscrape
  with:
    # Version of Flyscrape used to execute the script.
    #
    # Default: latest
    version: ''

    # Arguments to pass to `flyscrape run`. See
    # https://github.com/philippta/flyscrape for a complete list of options.
    args: ''

    # Path to script executed by Flyscrape. This input is required.
    script: ''
```

## Getting Script Output
Assuming you haven't saved the content of the script to a file, the output can
be retrived from this action's output. Extending the example above, you can
echo the output using this additional action

```yaml
- name: Print result
  run: |
    echo "${{ steps.run-flyscrape.outputs.output }}"
```
