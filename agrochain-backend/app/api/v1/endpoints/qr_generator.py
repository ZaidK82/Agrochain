import qrcode

def generate_qr(batch_id: str):

	url = f"http://localhost:3000/traceability?batch={batch_id}"

	img = qrcode.make(url)

	path = f"qr_{batch_id}.png"
	img.save(path)

	return path