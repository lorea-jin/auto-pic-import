import { loadConfig } from 'unconfig'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

let cwd = process.cwd()


let reg = /[*|&|%|\-\|#|@|^|!]/g

async function main() {
	const { config: configArray } = await loadConfig<AutoImportConfig>({
		sources: [
			{
				files: 'autoImport.config', // load from `my.config.xx`
				extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
			},
		],
	})
	if (Array.isArray(configArray?.configs)) {
		configArray.configs.forEach(obj => {
			const { targetDir, autoPrefix = false, depth = true, outputDir = targetDir, customImport } = obj

			if (!targetDir) {
				console.error(chalk.bgRedBright('Please check the autoImport.config.ts. lack of targetDir'));
				process.exit(-1)
			}
			const absoluteOutputDir = path.resolve(cwd, outputDir)
			const fileArr = findFile(targetDir, absoluteOutputDir, depth, autoPrefix)
			if (fileArr) {
				generated(fileArr, absoluteOutputDir, customImport)
			}
		})
	}
	process.exit()
}


function findFile(targetDir: string, absoluteOutputDir: string, depth: boolean, autoPrefix: boolean): picConfig[] {
	const result = []
	const absoluteTargetDirPath = path.resolve(cwd, targetDir)
	const files = fs.readdirSync(absoluteTargetDirPath)

	for (const value of files) {
		const targetFileDir = path.resolve(absoluteTargetDirPath, value)
		if (fs.statSync(targetFileDir).isDirectory()) {
			if (depth) {
				result.push(findFile(targetFileDir, absoluteOutputDir, depth, autoPrefix))
			}
		} else {
			if (value !== 'index.ts') {
				const { fileName, fileType } = translateFileName(value, autoPrefix)
				result.push({
					fileName: isNameLegal(fileName),
					fileUrl: changeSlash(path.relative(absoluteOutputDir, targetFileDir)),
					fileType: fileType
				})
			}
		}
	}
	return result.flat()
}


function translateFileName(file: string, autoPrefix: boolean): picConfig {
	const lastDotIndex = file.lastIndexOf('.')
	let fileName = file.slice(0, lastDotIndex)
	const fileType = file.slice(lastDotIndex + 1, file.length).toUpperCase()
	fileName = autoPrefix ? fileType + fileName : fileName

	return { fileName, fileType }
}

function generated(fileArr: picConfig[], outputDir: string, customImport: CustomImportFn | undefined) {
	let generatedContext: string = generateText(fileArr, customImport)
	fs.writeFileSync(`${outputDir}/index.ts`, generatedContext)
	console.warn(chalk.bgBlue(`${path.resolve(cwd, `${outputDir}/index.ts`)}生成完毕，小弟撤退了🚗~`))
}

function generateText(fileData: picConfig[], customImport: CustomImportFn | undefined) {
	let importStc
	if (typeof customImport === 'function') {
		importStc= fileData.reduce((pre, cur) => {
			pre += customImport(cur.fileName, cur.fileUrl as string) + '\n'
			return pre
		}, '')
	 }else{
		importStc = 	fileData.reduce((sum, cur) => {
			sum += `import ${cur.fileName} from  './${cur.fileUrl}'\n`
			return sum
		}, '')
	 }

	let expStc = `export {${fileData.map(i => i.fileName).join(',\n')}}`
	return importStc + '\n' + expStc

}


function isNameLegal(str: string) {
	str = str.replace(reg, '_')
	return str
}

function changeSlash(str: string) {
	let exp = /\\/g
	str = str.replace(exp, '/')
	return str
}

// type Guard
type CustomImportFn = (fileName: string, fileUrl: string, fileType?: string) => string

interface picConfig {
	fileName: string,
	fileType: string,
	fileUrl?: string
}

interface configs {
	targetDir: string
	outputDir?: string
	depth?: boolean
	autoPrefix?: boolean
	customImport?: CustomImportFn
}

interface AutoImportConfig {
	configs: configs[]
}


function defineAutoImportConfig(config: AutoImportConfig): AutoImportConfig {
	return config
}

export { defineAutoImportConfig, main }
