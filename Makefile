build:
	docker build -t bidding-war-onlie .
front:
	docker run -p 8081:8081 bidding-war-onlie