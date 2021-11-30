# initial build to create build path
npm run build

# copy wasm
cp message-signing/rust/pkg/emurgo_message_signing_bg.wasm netlify/functions/server/build/emurgo_message_signing_bg.wasm

# start
npm start