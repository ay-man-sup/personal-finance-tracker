# Image Setup for Fun Popups

Please save the following images to `/client/public/images/`:

1. **cat-hello.jpg** - The cute cat saying "hello" (for login popup)
2. **money-throw.gif** - The guy throwing money (for income popup)  
3. **spending-mirror.jpg** - "When are you going to stop spending our money?" (for expense popup)
4. **bank-account.jpg** - Drake checking bank account after weekend (for expense popup)

## Image locations in the code:
- `/client/src/components/common/FunPopup.jsx` references these images from `/images/`

## Quick setup:
Copy your images to: `client/public/images/`

The popup will gracefully hide if an image fails to load.
