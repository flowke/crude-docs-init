#!/usr/bin/env node
const path = require('path');
const fse = require('fs-extra');
const shell = require('shelljs');
const chalk = require('chalk');
const pg = require('commander');

let hasYarn = false;
if(shell.which('yarn')){
  hasYarn = true;
}

pg.version('0.1.0', '-v, --version');

pg
  .command('* <dir>')
  .description('创建项目')
  .action(create);

pg.parse(process.argv);

function create(dir){
  const CWD = process.cwd();

  if(path.isAbsolute(dir)){
      console.error(chalk.red(`项目路径不能为绝对路径!!`));
      console.error(`
        使用绝对路径可能会导致项目创建于根路径之上, 这可能不易于管理您的项目.
        这有一个创建项目的例子:
          crude-init my-docs
      `);
      process.exit(1);
  }

  if(dir===undefined){
    console.log(`
      你需要制定一个路径名, 以便生成文档模板.
      如果您想在当前目录生成文档, 使用: '.'
    `);
    process.exit(1);
  }

  if (fse.pathExistsSync(path.resolve(CWD, dir))) {
    console.error(chalk.red(`项目路径 "${dir}" 已存在, 请使用新的路径名.\n`));

    process.exit(1);
  }



  shell.mkdir(dir);

  console.log(chalk.green(`创建了文件夹: ${dir}\n`));

  console.log(chalk.yellow(`开始在 ${dir} 安装最新的 crude-docs\n`));

  const packageJSON = {
    "name": path.format(dir),
    "description": `A doc for ${path.format(dir)}`,
    scripts: {
      start: 'crude start',
      build: 'crude build',
      preview: 'crude preview',
    },

  };

  fse.writeFileSync(
    path.resolve(CWD, dir, 'package.json'),
    JSON.stringify(packageJSON, null, 2) + '\n'
  );

  shell.cd(dir);
  // 安装 crude-docs
  installDev('crude-docs');

  try{

    fse.copySync(path.resolve(__dirname, '../fileTpl'), '.');

    console.log( chalk.green('创建成功') );

    console.log(chalk.green('您可以使用如下命令并开始工作:'));
    console.log(chalk.yellow(`  cd ${dir}`));
    console.log(chalk.yellow(`  crude start`));

  }catch(e){
    console.log( chalk.red('创建失败!') );
  }
}

function installDev(...args){
  if (hasYarn) {
    shell.exec(`yarn add ${args.join(' ')} --dev`);
  } else {
    shell.exec(`npm install ${args.join(' ')} --save-dev`);
  }
}
