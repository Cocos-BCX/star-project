COCOS_ACCURACY = 100000 
SYMBOL = 'COCOS'


function sendstar(to,stars)
	stars = tonumber(stars)
	chainhelper:transfer_from_owner(to,stars*COCOS_ACCURACY,SYMBOL,true)
end