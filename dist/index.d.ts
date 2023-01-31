type CustomImportFn = (fileName: string, fileUrl: string, fileType?: string) => string;
interface configs {
    targetDir: string;
    outputDir?: string;
    depth?: boolean;
    autoPrefix?: boolean;
    customImport?: CustomImportFn;
}
interface AutoImportConfig {
    configs: configs[];
}
declare function defineAutoImportConfig(config: AutoImportConfig): AutoImportConfig;

export { defineAutoImportConfig };
