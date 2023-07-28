// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import {commonModule} from './commonModule';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "objectScript.contextmenu" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('objectScript.contextmenu.addComment', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from CommentInObjectScript!');

		const common = new commonModule;
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			//const selection = editor.selection;
			const selection = editor.selection;
			const line = selection.active.line;
			const text = document.lineAt(line).text.trim();
			if (text) {
				const now = new Date();
				const nowDate = now.getFullYear()+"/"+String(100 + (now.getMonth() + 1)).substring(1)+"/"+String(100 + now.getDate()).substring(1);
				const nowTime = String(100 + now.getHours()).substring(1)+":"+String(100 + now.getMinutes()).substring(1);
				const config = vscode.workspace.getConfiguration("commentinobjectscript");
				const createrName = config.get<string>("createrName");
				const copyright = config.get<string>("copyright");
				let comment: string = "";

				// クラス
				let res = text.match(/^Class \w+./);
				if (res) {
					// クラス用コメント
					comment = config.get<string>("commentClass") || "";
					comment = comment.trim()+"\n";
					const params = {
						"nowDate": nowDate,
						"nowTime": nowTime,
						"createrName": createrName
					}
					comment = common.replaceTextParameters(comment, params);
				}

				// メソッド
				res = text.match(/^(?:ClassMethod|Method) \w+.\(/);
				if (res) {
					// メソッド用コメント
					comment = config.get<string>("commentMethod") || "";
					comment = comment.trim()+"\n";
					const params = {
						"nowDate": nowDate,
						"nowTime": nowTime,
						"createrName": createrName
					}
					comment = common.replaceTextParameters(comment, params);

					const argFlg = config.get<boolean>("commentMethodAddArguments") || false;

					let dat = text.substring(res[0].length);
					let ret = dat.substring(dat.indexOf(")"));

					if (argFlg) {
						const args = dat.substring(0, dat.length - ret.length).split(",");
						ret = ret.replace(")", "");

						let f: boolean = false;
						for (let i = 0; i < args.length; i++) {
							let arg = args[i];
							arg = arg.replace(/^\s+|\s+$/g,'');
							if (arg != "") {
								if (!f) {
									f = true;
									comment = comment+"/// Parameters:<br>\n/// <ul>\n";
								}
								let args = arg.split(" ");
								let argnm = args[0];
								let p = 2;
								if (argnm.toLowerCase() == "byref") {
									argnm = args[1];
									p = 3;
								}
								let argType = "";
								let defalt = "";
								if (args.length > 2) {
									argType = ": <class>"+args[p]+"</class>";
								}
								if (arg.indexOf("=") > 0) {
									let wdat = arg.substring(arg.indexOf("=")+1).trim();
									defalt = " (初期値："+wdat+")";
								}
								comment = comment+"///  <li>"+argnm+argType+defalt+"</li>\n";
							}
						}
						if (f) {
							comment = comment+"/// </ul>\n";
						}
					}
					
					if (ret != "") {
						let rets = ret.replace(/^\s+|\s+$/g,'').split(" ");
						comment = comment+"/// Returns: <br>\n///  <class>"+rets[1]+"</class>\n";
					}
				}

				// パラメータ
				res = text.match(/^Parameter \w+./);
				if (res) {
					// パラメーター用コメント
					comment = config.get<string>("commentParameter") || "";
					comment = comment.trim()+"\n";
					const params = {
						"nowDate": nowDate,
						"nowTime": nowTime,
						"createrName": createrName
					}
					comment = common.replaceTextParameters(comment, params);
				}

				// プロパティ
				res = text.match(/^Property \w+./);
				if (res) {
					// プロパティ用コメント
					comment = config.get<string>("commentProperty") || "";
					comment = comment.trim()+"\n";
					const params = {
						"nowDate": nowDate,
						"nowTime": nowTime,
						"createrName": createrName
					}
					comment = common.replaceTextParameters(comment, params);
				}

				// インデックス
				res = text.match(/^Index \w+./);
				if (res) {
					// インデックス用コメント
					comment = config.get<string>("commentIndex") || "";
					comment = comment.trim()+"\n";
					const params = {
						"nowDate": nowDate,
						"nowTime": nowTime,
						"createrName": createrName
					}
					comment = common.replaceTextParameters(comment, params);
				}

				if (comment != "") {
					comment = comment;
					editor.edit((edit) => {
						const location: vscode.Position = new vscode.Position(line, 0);
						edit.replace(location, comment);
					});
				} else {
					comment = "// Description";
					editor.edit((edit) => {
						edit.replace(selection, comment);
					});
				}
			} else {
				const comment = "// Description";
				editor.edit((edit) => {
					edit.replace(selection, comment);
				});
			}
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
