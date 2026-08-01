import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, TextInput } from 'react-native'

// Drop-in replacement for @twotalltotems/react-native-otp-input, which
// crashes on mount (TextInput throwing inside React Native's own
// InternalTextInput, plus Hermes "property is not writable" console errors)
// under this app's stack — Expo 53 / RN 0.79.5 / React 19 with the New
// Architecture on by default. That library hasn't been updated since before
// Fabric existed. This only implements the prop surface this app actually
// uses (pinCount, style, codeInputFieldStyle, codeInputHighlightStyle,
// autoFocusOnLoad, code, onCodeChanged, onCodeFilled, editable).
function codeToDigits(code, pinCount) {
  const digits = (code ?? '').split('').slice(0, pinCount)
  while (digits.length < pinCount) digits.push('')
  return digits
}

function OTPInputView({
  pinCount = 4,
  style,
  codeInputFieldStyle,
  codeInputHighlightStyle,
  autoFocusOnLoad,
  code = '',
  onCodeChanged,
  onCodeFilled,
  editable = true
}) {
  const inputRefs = useRef([])
  const digits = useMemo(() => codeToDigits(code, pinCount), [code, pinCount])
  const [focusedIndex, setFocusedIndex] = useState(null)

  useEffect(() => {
    if (autoFocusOnLoad) {
      inputRefs.current[0]?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function emitChange(nextDigits) {
    const joined = nextDigits.join('')
    onCodeChanged && onCodeChanged(joined)
    if (joined.length === pinCount && nextDigits.every((d) => d !== '')) {
      onCodeFilled && onCodeFilled(joined)
    }
  }

  function handleChangeText(index, text) {
    if (text.length > 1) {
      // Autofill/paste delivers the whole code into whichever box is
      // focused — distribute it across the remaining boxes from here.
      const chars = text.split('')
      const nextDigits = [...digits]
      let i = index
      let c = 0
      while (i < pinCount && c < chars.length) {
        nextDigits[i] = chars[c]
        i += 1
        c += 1
      }
      emitChange(nextDigits)
      inputRefs.current[Math.min(i, pinCount - 1)]?.focus()
      return
    }

    const nextDigits = [...digits]
    nextDigits[index] = text
    emitChange(nextDigits)

    if (text && index < pinCount - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyPress(index, key) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const nextDigits = [...digits]
      nextDigits[index - 1] = ''
      emitChange(nextDigits)
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between' }, style]}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref }}
          style={[
            defaultBoxStyle,
            codeInputFieldStyle,
            focusedIndex === index ? codeInputHighlightStyle : null
          ]}
          value={digit}
          onChangeText={(text) => handleChangeText(index, text)}
          onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          selectTextOnFocus
          editable={editable}
        />
      ))}
    </View>
  )
}

const defaultBoxStyle = {
  width: 45,
  height: 45,
  borderColor: 'rgba(226, 226, 226, 1)',
  borderWidth: 1,
  borderRadius: 2,
  textAlign: 'center',
  fontSize: 18
}

export default OTPInputView
