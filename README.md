[![NPM Version](https://img.shields.io/npm/v/gemini-json-reporter.svg?style=flat)](https://www.npmjs.org/package/gemini-json-reporter)
[![Build Status](https://img.shields.io/travis/holidaycheck/gemini-json-reporter/master.svg?style=flat)](https://travis-ci.org/holidaycheck/gemini-json-reporter)
[![Coverage Status](https://img.shields.io/coveralls/holidaycheck/gemini-json-reporter/master.svg?style=flat)](https://coveralls.io/r/holidaycheck/gemini-json-reporter)
[![Dependencies](http://img.shields.io/david/holidaycheck/gemini-json-reporter.svg?style=flat)](https://david-dm.org/holidaycheck/gemini-json-reporter)

# gemini-json-reporter

Plugin for [Gemini](http://gemini-testing.github.io/gemini/) which enables to report to a single JSON file.

The images will be included in the JSON file as base64 encoded strings.

## Configuration

To use this plugin set the following configuration in gemini config file:

```yml
  system:
    plugins:
      json-reporter:
        reportFile: ./myTestReport.json
```

If `reportFile` is a relative path then it will be resolved to the current working directory.

## Example

The following is a formatted example output of this reporter:

```json
[
    {
        "hash": "bc7c827a8e6b9ed652399af55fc9e01c35ec0c74a690b2affe0bab4c2506e011",
        "type": "success",
        "suitePath": [ "foo" ],
        "stateName": "plain",
        "browserId": "firefox",
        "referencePath": "/path/to/the/reference/image.png"
    },
    {
        "hash": "9584ddd8f7f6ec0a5dd7157bb96da9b08211ee9b437f62ddd98cb7fff4b35f22",
        "type": "failure",
        "suitePath": [ "foo", "bar" ],
        "stateName": "hovered",
        "browserId": "chrome",
        "referencePath": "/path/to/the/reference/image/bar.png",
        "images": {
            "actual": "<base64 encoded image>",
            "diff": "<base64 encoded image>"
        }
    }
]
```

## Details

The JSON report is a flat list of all test results. Each test result gets a hash value which makes it possible to uniquely identify a test result within the list.

There are 4 different cases how a test result can look like:

1. type: `success`:

    ```json
      {
          "hash": "9584ddd8f7f6ec0a5dd7157bb96da9b08211ee9b437f62ddd98cb7fff4b35f22",
          "type": "success",
          "suitePath": [ "foo" ],
          "stateName": "plain",
          "browserId": "firefox",
          "referencePath": "/path/to/reference/image.png"
      }
    ```

2. type: `failure`:

    ```json
      {
          "hash": "9584ddd8f7f6ec0a5dd7157bb96da9b08211ee9b437f62ddd98cb7fff4b35f22",
          "type": "failure",
          "suitePath": [ "foo" ],
          "stateName": "plain",
          "browserId": "firefox",
          "referencePath": "/path/to/reference/image.png",
          "image": {
              "actual": "<base64 encoded image>",
              "diff": "<base64 encoded image>"
          }
      }
    ```

3. type: `error`, name: `NoRefImageError`

    ```json
      {
          "hash": "9584ddd8f7f6ec0a5dd7157bb96da9b08211ee9b437f62ddd98cb7fff4b35f22",
          "type": "error",
          "suitePath": [ "foo" ],
          "stateName": "plain",
          "browserId": "firefox",
          "referencePath": "/path/to/reference/image.png",
          "error": {
              "name": "NoRefImageError",
              "message": "Can not find reference image at /path/to/reference/image.png.\nRun `gemini update` command to capture all reference images."
          },
          "images": {
              "actual": "<base 64 encoded image>"
          }

      }
    ```

4. type: `error`

    ```json
      {
          "hash": "9584ddd8f7f6ec0a5dd7157bb96da9b08211ee9b437f62ddd98cb7fff4b35f22",
          "type": "error",
          "suitePath": [ "foo" ],
          "stateName": "plain",
          "browserId": "firefox",
          "error": {
              "name": "GeminiError",
              "message": "Cannot launch browser firefox …",
              "stack": "<stacktrace>"
          }
      }
    ```
