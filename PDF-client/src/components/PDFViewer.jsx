import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Draggable from "react-draggable";

const PDFPreview = () => {
	const [config, setConfig] = useState({});
	const [selectedElement, setSelectedElement] = useState(null);
	const [showEditBox, setShowEditBox] = useState(false);
	const [editText, setEditText] = useState("");
	const [editImgUrl, setEditImgUrl] = useState("");
	const [editWidth, setEditWidth] = useState(150); // Set default width
	const pdfContainerRef = useRef(null);
	const editBoxRef = useRef(null);

	const handleTextEdit = (e) => {
		setEditText(e.target.value);
		setConfig((prevConfig) => ({
			...prevConfig,
			[selectedElement]: {
				...prevConfig[selectedElement],
				value: e.target.value,
			},
		}));
	};

	const handleImgUrlEdit = (e) => {
		setEditImgUrl(e.target.value);
		setConfig((prevConfig) => ({
			...prevConfig,
			[selectedElement]: {
				...prevConfig[selectedElement],
				src: e.target.value,
			},
		}));
	};

	const handleWidthEdit = (e) => {
		setEditWidth(e.target.value);
		setConfig((prevConfig) => ({
			...prevConfig,
			[selectedElement]: {
				...prevConfig[selectedElement],
				width: e.target.value,
			},
		}));
	};

	const addTextBox = () => {
		const id = `text_${
			Object.keys(config).filter((key) => key.includes("text_")).length + 1
		}`;

		setConfig((prevConfig) => ({
			...prevConfig,
			[id]: {
				type: "text",
				value: "New Text",
				x: 50,
				y: 50,
				fontSize: 16,
				color: "#000",
				width: 150, // Set default width
				styles: "{}",
			},
		}));
	};

	const addImgBox = () => {
		const id = `image_${
			Object.keys(config).filter((key) => key.includes("image_")).length + 1
		}`;
		setConfig((prevConfig) => ({
			...prevConfig,
			[id]: {
				type: "image",
				src: "https://via.placeholder.com/150",
				x: 50,
				y: 50,
				width: 150, // Set default width
			},
		}));
	};

	const handleDrag = (e, data, key) => {
		setConfig((prevConfig) => ({
			...prevConfig,
			[key]: {
				...prevConfig[key],
				x: data.x,
				y: data.y,
			},
		}));
	};

	const handleElementSelection = (key) => {
		setSelectedElement(key);
		setShowEditBox(true);
		const element = config[key];
		if (element.type === "text") {
			setEditText(element.value);
		} else if (element.type === "image") {
			setEditImgUrl(element.src);
		}
		setEditWidth(element.width);
	};

	const handleFontSizeChange = (e) => {
		setConfig((prevConfig) => ({
			...prevConfig,
			[selectedElement]: {
				...prevConfig[selectedElement],
				fontSize: parseInt(e.target.value),
			},
		}));
	};

	const handleColorChange = (e) => {
		setConfig((prevConfig) => ({
			...prevConfig,
			[selectedElement]: {
				...prevConfig[selectedElement],
				color: e.target.value,
			},
		}));
	};

	const handleBoldToggle = () => {
		const currentStyles = JSON.parse(
			prevConfig[selectedElement]?.styles || "{}"
		);
		const newFontWeight =
			currentStyles.fontWeight === "bold" ? "normal" : "bold";

		setConfig((prevConfig) => ({
			...prevConfig,
			[selectedElement]: {
				...prevConfig[selectedElement],
				styles: JSON.stringify({
					...currentStyles,
					fontWeight: newFontWeight,
				}),
			},
		}));
	};

	const deleteElement = () => {
		setConfig((prevConfig) => {
			const newConfig = { ...prevConfig };
			delete newConfig[selectedElement];
			return newConfig;
		});
		setSelectedElement(null);
		setShowEditBox(false);
	};

	const downloadPDF = async () => {
		const pdf = new jsPDF("portrait", "mm", "a4");
		const pdfContainer = pdfContainerRef.current;
		const canvas = await html2canvas(pdfContainer, {
			useCORS: true,
			allowTaint: false,
			logging: true,
			letterRendering: 1,
		});
		const imgData = canvas.toDataURL("image/png");
		pdf.addImage(imgData, "PNG", 0, 0);
		pdf.save("document.pdf");
	};

	const saveConfig = () => {
		fetch("http://localhost:8000/update-pdf-config", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(config),
		}).catch((error) => console.error("Error saving PDF config:", error));
	};

	const copyCodeToClipboard = () => {
		const json = JSON.stringify(config, null, 2);
		navigator.clipboard.writeText(json);
		alert("Configuration code copied to clipboard");
	};

	useEffect(() => {
		fetch("http://localhost:8000/pdf-config")
			.then((response) => response.json())
			.then((data) => setConfig(data))
			.catch((error) => console.error("Error fetching PDF config:", error));
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (editBoxRef.current && !editBoxRef.current.contains(event.target)) {
				setShowEditBox(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<>
			<div style={{ marginBottom: "20px" }}>
				<button onClick={addTextBox} style={{ marginRight: "10px" }}>
					Add Text Box
				</button>
				<button onClick={addImgBox} style={{ marginRight: "10px" }}>
					Add Image Box
				</button>
				<button onClick={downloadPDF} style={{ marginRight: "10px" }}>
					Download PDF
				</button>
				<button onClick={saveConfig} style={{ marginRight: "10px" }}>
					Save Configuration
				</button>
				<button onClick={copyCodeToClipboard} style={{ marginRight: "10px" }}>
					Copy Code to Clipboard
				</button>
			</div>

			<div
				ref={pdfContainerRef}
				style={{
					width: "210mm",
					height: "297mm",
					border: "1px solid black",
					position: "relative",
					margin: "auto",
				}}
			>
				{Object.keys(config).map((key) => {
					const element = config[key];
					if (element.type === "text") {
						return (
							<Draggable
								key={key}
								position={{ x: element.x, y: element.y }}
								onDrag={(e, data) => handleDrag(e, data, key)}
								onStop={() => handleElementSelection(key)}
							>
								<div
									style={{
										position: "absolute",
										fontSize: `${element.fontSize}px`,
										color: element.color,
										fontWeight:
											JSON.parse(element.styles || "{}").fontWeight || "normal",
										cursor: "pointer",
										width: `${element.width}px`,
										whiteSpace: "pre-wrap", // Allow text to wrap
									}}
								>
									{element.value}
								</div>
							</Draggable>
						);
					} else if (element.type === "image") {
						return (
							<Draggable
								key={key}
								position={{ x: element.x, y: element.y }}
								onDrag={(e, data) => handleDrag(e, data, key)}
								onStop={() => handleElementSelection(key)}
							>
								<div
									style={{
										position: "absolute",
										cursor: "pointer",
									}}
								>
									<img src={element.src} alt="" width={element.width} />
								</div>
							</Draggable>
						);
					}
					return null;
				})}
			</div>

			{showEditBox && (
				<div
					ref={editBoxRef}
					style={{
						position: "fixed",
						top: "100px",
						right: "20px",
						padding: "20px",
						background: "white",
						border: "1px solid black",
						zIndex: 1000,
						width: "400px",
					}}
				>
					{config[selectedElement]?.type === "text" ? (
						<>
							<div>
								<textarea
									type="text"
									value={editText}
									onChange={handleTextEdit}
									style={{ width: "100%" }}
									rows={10}
								/>
								<label>Font Size: </label>
								<input
									type="number"
									value={config[selectedElement]?.fontSize || ""}
									onChange={handleFontSizeChange}
								/>

								<label> Color: </label>
								<input
									type="color"
									value={config[selectedElement]?.color || "#000000"}
									onChange={handleColorChange}
								/>
							</div>
							<div style={{ marginTop: "10px" }}>
								<label>Width: </label>
								<input
									type="number"
									value={editWidth}
									onChange={handleWidthEdit}
								/>
								<label> Bold: </label>
								<button onClick={handleBoldToggle}>
									{JSON.parse(config[selectedElement]?.styles || "{}")
										.fontWeight === "bold"
										? "Unbold"
										: "Bold"}
								</button>
							</div>
						</>
					) : config[selectedElement]?.type === "image" ? (
						<>
							<label>Image URL:</label>
							<input
								type="text"
								value={editImgUrl}
								onChange={handleImgUrlEdit}
								style={{ width: "100%" }}
							/>
							<label>Width:</label>
							<input
								type="number"
								value={editWidth}
								onChange={handleWidthEdit}
							/>
						</>
					) : null}
					<button onClick={deleteElement} style={{ marginTop: "10px" }}>
						Delete Element
					</button>
				</div>
			)}
		</>
	);
};

export default PDFPreview;
