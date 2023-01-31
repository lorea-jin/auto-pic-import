# auto-pic-import
A tool which can import pic automatically

## Notes:
pls name each pic correctly according to the Naming rules for variables

## Features
- Batch processing of images import,no need to import one by one
- Support prefix
- Support Customized output path 
- Support Customized import statement


## Usage
### Install
```js
npm i auto-pic-import
```

### Config file `autoImport.config.ts`

Name| Description | DefaultValue
-|-|-
targetDir(Required)         | the directory of targeted Files
outputDir                   | the directory of output file `index.ts` |  targetDir value
depth                       | Traversing subcategories     |true
autoPrefix                  | Add image Type as prefix     |false
customImport                | Customized statment          |

```js
import { defineAutoImportConfig } from 'auto-pic-import'

export default {
  configs: [
    {
      targetDir: './src/assets/images',
      depth: true,
      autoPrefix: true,
    },
    {
      targetDir: './src/assets/svgs',
      customImport: (fileName, fileUrl) => {
        return `import { SelfDefinedComponent as ${fileName} } from '${fileUrl}'`
      },
    },
  ],
}
```

### Example
![img](https://github.com/lorea-jin/auto-pic-import/blob/main/useDemo.gif)