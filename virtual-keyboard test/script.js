// create textarea
const input = document.createElement('textarea');
input.className = 'textarea';
document.body.appendChild(input);

// create keyboard
const keyBoard = document.createElement('div');
keyBoard.className = 'keyboard';
document.body.appendChild(keyBoard);

//--// public functions and variables
let isCaps = false;
let isShift = false;
let caretPosition = input.selectionStart;

String.prototype.insert = function(index, string) {
  if (index > 0) {
    return this.substring(0, index) + string + this.substr(index);
  }

  return string + this;
};

String.prototype.delete = function(index) {
  if (index > 0) {
    return this.slice(0, index) + this.slice(index + 1);
  }

  caretPosition = 1;

  return this.substring(1);
};

const getKey = (item, caps, shiftKey) => {
  if (item.code.includes('Key') && (caps || shiftKey)) {
    return item.key.toUpperCase();
  } else if (shiftKey) {
    return item.shiftKey ? item.shiftKey : item.key;
  }

  return item.key;
}

const changeElementStyle = (item, active) => {
  const element = item.element;
  element.className = `key ${active ? 'active' : item.colorStyle} ${item.sizeStyle}`;
}

const rerenderElement = (item, caps, shiftKey) => {
  const element = item.element;
  element.innerHTML = getKey(item, caps, shiftKey);
};

const rerenderKeys = (caps, shiftKey) => keyBoardLayout.forEach((item) => rerenderElement(item, caps, shiftKey));

input.addEventListener('click', (event) => {
  const textarea = document.getElementsByClassName('textarea')[0];
  caretPosition = textarea.selectionStart || 0;
});
//--//

// create layout
for(let i = 0; i < keysRu.length; i++) {
  const element = document.createElement('button');
  keysRu[i].element = element;
  keysEn[i].element = element;
}

const isRu = localStorage.getItem('isRu');
let keyBoardLayout = JSON.parse(isRu) ? keysRu : keysEn;

// render keyboard
keyBoardLayout.forEach((item) => {
  // mouse events
  if (item.code === 'CapsLock') {
    item.element.addEventListener('click', (event) => {
      if (isCaps) {
        isCaps = false;
        changeElementStyle({ ...item, element: item.element }, false);
        rerenderKeys(false, event.shiftKey);
      } else {
        isCaps = true;
        changeElementStyle({ ...item, element: item.element }, true);
        rerenderKeys(true, event.shiftKey);
      }
    });
  } else {
    item.element.addEventListener('mousedown', (event) => {
      changeElementStyle({ ...item, element: item.element }, true);

      if (item.key === 'Shift') {
        isShift = true;
        rerenderKeys(isCaps, true);
      }

      if (item.key.length === 1) {
        input.innerHTML = input.innerHTML.insert(caretPosition, getKey(item, isCaps, isShift || event.shiftKey));
        caretPosition += 1;
        input.setSelectionRange(caretPosition, caretPosition);
      }

      if (item.code === 'Backspace') {
        input.innerHTML = input.innerHTML.delete(caretPosition - 1);
        caretPosition -= 1;
        input.setSelectionRange(caretPosition, caretPosition);
      }

      if (item.code === 'Tab') {
        input.innerHTML = input.innerHTML.insert(caretPosition, '    ');
        caretPosition += 4;
        input.setSelectionRange(caretPosition, caretPosition);
      }

      if (item.code === 'Enter') {
        input.innerHTML = input.innerHTML.insert(caretPosition, '\n');
        caretPosition += 1;
        input.setSelectionRange(caretPosition, caretPosition);
      }
    });
    item.element.addEventListener('mouseup', (event) => {
      changeElementStyle({ ...item, element: item.element }, false);

      if (item.key === 'Shift') {
        isShift = false;
        rerenderKeys(isCaps, false);
      }
    });
  }

  rerenderElement(item);
  changeElementStyle(item);
  keyBoard.appendChild(item.element);
});

// keyboards events
document.addEventListener('keydown', (event) => {
  event.preventDefault();

  const keyItem = keyBoardLayout.find((key) => key.code === event.code);
  changeElementStyle(keyItem, true);

  if (event.code === 'CapsLock') {
    isCaps = true;
  }

  if (event.code === 'Tab') {
    input.innerHTML = input.innerHTML.insert(caretPosition, '    ');
    caretPosition += 4;
    input.setSelectionRange(caretPosition, caretPosition);
  }

  if (event.code === 'Enter') {
    input.innerHTML = input.innerHTML.insert(caretPosition, '\n');
    caretPosition += 1;
    input.setSelectionRange(caretPosition, caretPosition);
  }

  if (event.code === 'Backspace') {
    input.innerHTML = input.innerHTML.delete(caretPosition - 1);
    caretPosition -= 1;
    input.setSelectionRange(caretPosition, caretPosition);
  }

  if (event.key.length === 1) {
    input.innerHTML = input.innerHTML.insert(caretPosition, getKey(keyItem, isCaps, isShift || event.shiftKey));
    caretPosition += 1;
    input.focus();
    input.setSelectionRange(caretPosition, caretPosition);
  }

  if (event.code === 'AltLeft' && event.ctrlKey) {
    const isRu = localStorage.getItem('isRu');

    if (JSON.parse(isRu)) {
      localStorage.setItem('isRu', false);
      keyBoardLayout = keysEn.map((item) => {
        rerenderElement({ ...item, key: item.key, shiftKey: item.shiftKey });

        return { ...item, key: item.key, shiftKey: item.shiftKey };
      });
    } else {
      localStorage.setItem('isRu', true);
      keyBoardLayout = keysRu.map((item) => {
        rerenderElement({ ...item, key: item.key, shiftKey: item.shiftKey });

        return { ...item, key: item.key, shiftKey: item.shiftKey };
      });
    }
  }

  if (event.getModifierState('CapsLock') || isCaps) {
    rerenderKeys(true, event.shiftKey || isShift);
  } else {
    rerenderKeys(false, event.shiftKey || isShift);
  }
});

document.addEventListener('keyup', (event) => {
  const keyItem = keyBoardLayout.find((key) => key.code === event.code);
  changeElementStyle(keyItem, false);

  if (event.code === 'CapsLock') {
    isCaps = false;
  }

  if (event.getModifierState('CapsLock') || isCaps) {
    rerenderKeys(true, event.shiftKey || isShift);
  } else {
    rerenderKeys(false, event.shiftKey || isShift);
  }
});
