from typing import Union

from fastapi.responses import Response


import json


def resp_json(code, message, data: Union[list, dict, str, bool]) -> Response:

	if not isinstance(data, str):
		data = eval(str(data))

	content = {'code': code, 'msg': message, 'data': data, }
	content = json.dumps(content)
	
	response = Response(status_code=200, content=content, media_type='application/json')
	
	# 传递至中间件用于日志审计
	tmp = {}
	tmp['code'] = code
	tmp['msg'] = message
	response.headers['tmp'] = json.dumps(tmp)

	return response
