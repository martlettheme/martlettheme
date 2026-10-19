/** Starter ports: semantic editors and ANSI terminal colors. */
export function terminal(theme) {
 const t=theme.tokens, dark=theme.mode==='dark';
 const a=dark ? ['#122744','#FFA7AB','#9DC3AE','#FEE46E','#83AFF5','#C9AFFA','#7DCECF','#CED8E8','#455B76','#FFD0D1','#B4E2C7','#FFF1A1','#B9D2FF','#E4CAFF','#B4E8E8','#FFFFFF'] : ['#122744','#A02E42','#286B40','#805000','#154C9E','#68409B','#007582','#455B76','#61738B','#BB4158','#286B40','#925C00','#1959B9','#865CBD','#007582','#0D2038'];
 return {name:theme.name,background:t.bg,foreground:t.text,cursor:t.accent,selection:t.selection,
 ansi:Object.fromEntries(['black','red','green','yellow','blue','magenta','cyan','white','brightBlack','brightRed','brightGreen','brightYellow','brightBlue','brightMagenta','brightCyan','brightWhite'].map((key,i)=>[key,a[i]]))};
}
export function vscode(theme) {
 const t=theme.tokens;
 const colors={'editor.background':t.bg,'editor.foreground':t.text,'editorLineNumber.foreground':t.muted,'editorCursor.foreground':t.accent,'editor.selectionBackground':t.selection,'editor.inactiveSelectionBackground':t.panel2,'editorIndentGuide.background1':t.line,'editorWidget.background':t.panel,'editorError.foreground':t.danger,'editorWarning.foreground':t.warning,'editorInfo.foreground':t.info,'focusBorder':t.focus,'activityBar.background':t.panel,'sideBar.background':t.panel,'sideBar.foreground':t.text,'panel.background':t.panel,'statusBar.background':t.panel2,'statusBar.foreground':t.text,'button.background':t.accent,'button.foreground':t['on-accent'],'button.hoverBackground':t['accent-hover'],'input.background':t['input-bg'],'input.foreground':t['input-text'],'input.border':t['input-border'],'dropdown.background':t.panel,'dropdown.foreground':t.text,'terminal.background':t.bg,'terminal.foreground':t.text};
 const types=[
 [['comment','punctuation.definition.comment'],'syntax-comment','italic'],
 [['keyword','storage.type','storage.modifier'],'syntax-keyword'],
 [['string','string.quoted'],'syntax-string'],
 [['constant.numeric','constant.language'],'syntax-number'],
 [['entity.name.function','support.function'],'syntax-function'],
 [['entity.name.type','support.type','support.class'],'syntax-type'],
 [['variable','identifier'],'syntax-variable'],
 [['entity.name.tag'],'syntax-tag'],
 [['entity.other.attribute-name'],'syntax-attribute'],
 [['string.regexp'],'syntax-regexp'],
 [['invalid','invalid.illegal'],'syntax-invalid']
 ];
 return {name:theme.name,type:theme.mode,semanticHighlighting:true,colors,tokenColors:types.map(([scope,role,fontStyle])=>({scope,settings:{foreground:t[role],...(fontStyle?{fontStyle}:{})}}))};
}
