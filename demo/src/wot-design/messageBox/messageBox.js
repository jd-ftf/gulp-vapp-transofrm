import { getContext, isObj } from '../common/util'; // 默认模板

const defaultOptions = {
  showConfirmButton: true,
  title: '',
  showCancelButton: false,
  show: true,
  closeOnClickModal: true,
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  msg: '',
  type: 'alert',
  inputType: 'text',
  inputValue: '',
  inputPlaceholder: '请输入',
  inputPattern: '',
  inputValidate: '',
  showErr: false,
  selector: '#wd-message-box',
  zIndex: 99
}; // MessageBox注册的队列，此处使用队列方便后续边界管理

/**
 * @description 转换msg为对象形式，方便处理
 * @param msg
 * @return {{}|{msg: *}}
 */

const parseOptions = msg => {
  if (!msg) msg = {
    show: false
  };
  msg = isObj(msg) ? msg : {
    msg
  };
  msg.context = msg.context || getContext();
  return msg;
};
/**
 * @description MessageBox render
 * @param MessageBoxOptions
 * @return {wx.Component<any, any>}
 * @constructor
 */


const MessageBox = MessageBoxOptions => {
  // 覆盖模板中的选项
  const options = Object.assign({}, defaultOptions, parseOptions(MessageBoxOptions)); // 获取页面栈中栈顶页面(当前显示的页面)

  const instance = options.context.selectComponent(options.selector); // 返回一个promise

  return new Promise((resolve, reject) => {
    Object.assign(options, {
      onConfirm: () => {
        resolve({
          value: instance.data.inputValue
        });
      },
      onCancel: reject
    });
    instance.setData(options);
  });
};

const createMethod = type => {
  // 优先级：options->toastOptions->defaultOptions
  const MessageBoxOptions = {
    type
  };

  switch (type) {
    case 'alert':
      break;

    case 'confirm':
      MessageBoxOptions.showCancelButton = true;
      break;

    case 'prompt':
      MessageBoxOptions.showCancelButton = true;
      break;

    default:
      break;
  }

  return options => {
    return MessageBox(Object.assign({}, defaultOptions, MessageBoxOptions, parseOptions(options)));
  };
};

MessageBox.alert = createMethod('alert');
MessageBox.confirm = createMethod('confirm');
MessageBox.prompt = createMethod('prompt');
export default MessageBox;