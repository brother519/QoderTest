import React, { useState, useRef, useEffect } from 'react';
import { Card, Select, Button, Space, Tooltip, message } from 'antd';
import {
  CopyOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  FormatPainterOutlined,
  RedoOutlined,
  UndoOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { CODE_EDITOR_CONFIG } from '../../constants';

const { Option } = Select;

interface CodeEditorProps {
  defaultValue?: string;
  value?: string;
  language?: string;
  theme?: string;
  height?: number | string;
  options?: editor.IStandaloneEditorConstructionOptions;
  onChange?: (value: string | undefined) => void;
  onSave?: (value: string) => void;
  readOnly?: boolean;
  showToolbar?: boolean;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  defaultValue = '',
  value,
  language = CODE_EDITOR_CONFIG.DEFAULT_LANGUAGE,
  theme = CODE_EDITOR_CONFIG.DEFAULT_THEME,
  height = 400,
  options = {},
  onChange,
  onSave,
  readOnly = false,
  showToolbar = true,
  className = '',
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 处理编辑器挂载
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsLoading(false);

    // 设置编辑器选项
    editor.updateOptions({
      ...CODE_EDITOR_CONFIG.DEFAULT_OPTIONS,
      ...options,
      readOnly,
    });

    // 添加键盘快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('actions.find')?.run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  // 保存文件
  const handleSave = () => {
    if (editorRef.current && onSave) {
      const content = editorRef.current.getValue();
      onSave(content);
      message.success('保存成功');
    }
  };

  // 复制内容
  const handleCopy = async () => {
    if (editorRef.current) {
      const content = editorRef.current.getValue();
      try {
        await navigator.clipboard.writeText(content);
        message.success('代码已复制到剪贴板');
      } catch (error) {
        message.error('复制失败');
      }
    }
  };

  // 格式化代码
  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // 撤销
  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  };

  // 重做
  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  };

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 切换语言
  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, newLanguage);
      }
    }
  };

  // 切换主题
  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(newTheme);
    }
  };

  // 工具栏组件
  const renderToolbar = () => {
    if (!showToolbar) return null;

    return (
      <div className="code-editor-toolbar">
        <Space>
          <Select
            value={currentLanguage}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
            size="small"
          >
            {CODE_EDITOR_CONFIG.SUPPORTED_LANGUAGES.map(lang => (
              <Option key={lang.value} value={lang.value}>
                {lang.label}
              </Option>
            ))}
          </Select>

          <Select
            value={currentTheme}
            onChange={handleThemeChange}
            style={{ width: 100 }}
            size="small"
          >
            {CODE_EDITOR_CONFIG.THEMES.map(themeOption => (
              <Option key={themeOption.value} value={themeOption.value}>
                {themeOption.label}
              </Option>
            ))}
          </Select>
        </Space>

        <Space>
          {!readOnly && (
            <>
              <Tooltip title="撤销 (Ctrl+Z)">
                <Button
                  type="text"
                  size="small"
                  icon={<UndoOutlined />}
                  onClick={handleUndo}
                />
              </Tooltip>
              <Tooltip title="重做 (Ctrl+Y)">
                <Button
                  type="text"
                  size="small"
                  icon={<RedoOutlined />}
                  onClick={handleRedo}
                />
              </Tooltip>
              <Tooltip title="格式化 (Ctrl+Shift+F)">
                <Button
                  type="text"
                  size="small"
                  icon={<FormatPainterOutlined />}
                  onClick={handleFormat}
                />
              </Tooltip>
            </>
          )}
          
          <Tooltip title="复制代码">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
            />
          </Tooltip>
          
          {onSave && !readOnly && (
            <Tooltip title="保存 (Ctrl+S)">
              <Button
                type="text"
                size="small"
                icon={<SaveOutlined />}
                onClick={handleSave}
              />
            </Tooltip>
          )}
          
          <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
            <Button
              type="text"
              size="small"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
            />
          </Tooltip>
        </Space>
      </div>
    );
  };

  const editorHeight = isFullscreen ? '100vh' : height;

  return (
    <div
      className={`code-editor-container ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        background: '#fff',
      }}
    >
      {renderToolbar()}
      <Editor
        height={editorHeight}
        defaultLanguage={currentLanguage}
        defaultValue={defaultValue}
        value={value}
        theme={currentTheme}
        loading={<div style={{ padding: 20, textAlign: 'center' }}>加载编辑器中...</div>}
        onMount={handleEditorDidMount}
        onChange={onChange}
        options={{
          ...CODE_EDITOR_CONFIG.DEFAULT_OPTIONS,
          ...options,
          readOnly,
        }}
      />
    </div>
  );
};

export default CodeEditor;