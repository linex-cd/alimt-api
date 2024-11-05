from fastapi import FastAPI, Request, Header, HTTPException, Body
from typing import Optional
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware


from util.resp import resp_json
import json
import time

vesion = '1.0.0'
title = 'alimt'
desp = 'alimt'

app = FastAPI(title=title, description=desp, version=vesion)

app.mount("/assets", StaticFiles(directory="./assets"), name="assets")

# #################
# 跨域配置
origins = [
	"*",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# #################
# Swagger文档资源本地化
from fastapi.openapi.docs import (
    get_redoc_html,
    get_swagger_ui_html,
    get_swagger_ui_oauth2_redirect_html,
)

# Windows/Mac下开发 才显示文档
import platform

#if (platform.system() == 'Darwin' or platform.system() == 'Windows'):
if 1:


	@app.get("/sd", include_in_schema=False)
	async def custom_swagger_ui_html():
		return get_swagger_ui_html(
			openapi_url=app.openapi_url,
			title=app.title + " - Swagger UI",
			oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
			swagger_js_url="/assets/doc/swagger-ui-bundle.js",
			swagger_css_url="/assets/doc/swagger-ui.css",
			swagger_favicon_url="/assets/doc/favicon.png",
		)


	@app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
	async def swagger_ui_redirect():
		return get_swagger_ui_oauth2_redirect_html()


	@app.get("/rd", include_in_schema=False)
	async def redoc_html():
		return get_redoc_html(
			openapi_url=app.openapi_url,
			title=app.title + " - ReDoc",
			redoc_js_url="/assets/doc/redoc.standalone.js",
		)

# endif




@app.get(path="/")
async def index(request: Request):
	response = RedirectResponse(url='http://www.google.com/')
	return response
	
	
from typing import List

from alibabacloud_alimt20181012.client import Client as alimt20181012Client
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_alimt20181012 import models as alimt_20181012_models
from alibabacloud_tea_util import models as util_models
from alibabacloud_tea_util.client import Client as UtilClient

config = open_api_models.Config(
		access_key_id='',
		access_key_secret=''
	)

config.endpoint = f'mt.aliyuncs.com'

client = alimt20181012Client(config)


@app.post(path="/alimt")
async def alimt(request: Request, text: str = Body(..., title='文本', embed=True),):

	

	get_detect_language_request = alimt_20181012_models.GetDetectLanguageRequest(
		source_text = text
	)
	
	
	runtime = util_models.RuntimeOptions()

	if 1:
		# 复制代码运行请自行打印 API 的返回值
		ret = await client.get_detect_language_with_options_async(get_detect_language_request, runtime)
		ret = json.loads(str(ret).replace("'",'"'))
		if ret['statusCode'] == 200:
			return resp_json(code= ret['statusCode'] , data=ret['body']['DetectedLanguage'], message="ok")
			
		else:
			return resp_json(code= ret['statusCode'] , data='', message="api fail")
		
	else: #except Exception as error:
		# 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
		# 错误 message
		print(error.message)
		# 诊断地址
		print(error.data.get("Recommend"))
		UtilClient.assert_as_string(error.message)


	
	return resp_json(code=500, data="", message="api fail")





if __name__ == '__main__':
	import uvicorn
	import sys
	from uvicorn.config import LOGGING_CONFIG
	LOGGING_CONFIG["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelprefix)s %(message)s"
	LOGGING_CONFIG["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelprefix)s %(message)s"
	
	if len(sys.argv) > 1 and sys.argv[1] == 'debug':
		uvicorn.run('main:app', host="0.0.0.0", port=7001, log_config=LOGGING_CONFIG, reload=True)
		
	else:
		uvicorn.run('main:app', host="0.0.0.0", port=7001, log_config=LOGGING_CONFIG, workers = 4)
		
	#endif

