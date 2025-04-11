
CURRENT_PATH=$(pwd)
SCRAP_JS_FILE="$CURRENT_PATH/scrap.js"
SCRAP_TS_FILE="$CURRENT_PATH/scrap.ts"

function remove_js_script_if_exist {
  if [ -f "$SCRAP_JS_FILE" ]; then
    rm -rf "$SCRAP_JS_FILE"
  fi
}

function compile_ts_script {
  tsc "$SCRAP_TS_FILE"
}

function execute_scrapping {
  node "$SCRAP_JS_FILE"
  exit 1
}

#remove_js_script_if_exist
compile_ts_script
execute_scrapping