import { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
} from "firebase/firestore";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
} from "firebase/storage";
import packageInfo from "../../package.json";
import "bootstrap/dist/css/bootstrap.min.css";

/*─────────────────────────────────────────────────────────────*/

const ProjectManager = () => {
    /* ---------- state ---------- */
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({
        id: "",
        type: "",
        title: "",
        subtitle: "",
        description: "",
        location: "",
        date: "",
        journal: { name: "", volume: "", number: "", pages: "" },
        authors: "",
        award: "",
        url: "",
        sourceUrl: "",
        target_url: "",
        category: "", // "academic" | "product"
    });

    const [mainImageFile, setMainImageFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [typeList, setTypeList] = useState([]);
    const [authorInput, setAuthorInput] = useState("");
    const [authorList, setAuthorList] = useState([]);

    const isAcademic = newProject.category === "academic";

    /* ---------- firestore ---------- */
    const fetchProjects = async () => {
        try {
            const qs = await getDocs(collection(db, "projects"));
            setProjects(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    };
    useEffect(() => {
        fetchProjects();
    }, []);

    /* ---------- upload helper ---------- */
    const uploadFileWithProgress = (file, path) =>
        new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const task = uploadBytesResumable(storageRef, file);

            task.on(
                "state_changed",
                (snap) => {
                    const prog = (snap.bytesTransferred / snap.totalBytes) * 100;
                    setUploadProgress((prev) => [
                        ...prev.filter((f) => f.name !== file.name),
                        { name: file.name, progress: Math.round(prog) },
                    ]);
                },
                reject,
                async () => resolve(await getDownloadURL(task.snapshot.ref))
            );
        });

    /* ---------- save ---------- */
    const handleSaveProject = async () => {
        if (!newProject.id) return alert("Project ID is required!");
        try {
            const mainImageUrl = mainImageFile
                ? await uploadFileWithProgress(
                    mainImageFile,
                    `projects/${newProject.id}/main_image`
                )
                : newProject.main_image;

            const imageUrls = [];
            for (const f of imageFiles)
                imageUrls.push(
                    await uploadFileWithProgress(
                        f,
                        `projects/${newProject.id}/images/${f.name}`
                    )
                );

            const videoUrls = [];
            for (const f of videoFiles)
                videoUrls.push(
                    await uploadFileWithProgress(
                        f,
                        `projects/${newProject.id}/videos/${f.name}`
                    )
                );

            const data = {
                ...newProject,
                type: typeList,
                authors: authorList,
                main_image: mainImageUrl,
                images: imageUrls.length ? imageUrls : newProject.images || [],
                videos: videoUrls.length ? videoUrls : newProject.videos || [],
            };

            await setDoc(doc(db, "projects", newProject.id), data);
            alert(isEditing ? "Project updated!" : "Project added!");
            resetForm();
            fetchProjects();
        } catch (err) {
            console.error("Error saving project:", err);
        }
    };

    /* ---------- reset ---------- */
    const resetForm = () => {
        setNewProject({
            id: "",
            type: "",
            title: "",
            subtitle: "",
            description: "",
            location: "",
            date: "",
            journal: { name: "", volume: "", number: "", pages: "" },
            authors: "",
            award: "",
            url: "",
            sourceUrl: "",
            target_url: "",
            category: "",
        });
        setMainImageFile(null);
        setImageFiles([]);
        setVideoFiles([]);
        setUploadProgress([]);
        setIsEditing(false);
    };

    /* ---------- delete ---------- */
    const deleteFolderContents = async (folderRef) => {
        const list = await listAll(folderRef);
        for (const i of list.items) await deleteObject(i);
        for (const p of list.prefixes) await deleteFolderContents(p);
    };
    const handleDeleteProject = async (projectId) => {
        try {
            setDeleteProgress(0);
            await deleteDoc(doc(db, "projects", projectId));
            await deleteFolderContents(ref(storage, `projects/${projectId}`));
            alert("Project deleted!");
            fetchProjects();
        } catch (err) {
            console.error("Error deleting project:", err);
        } finally {
            setDeleteProgress(0);
        }
    };

    /* ---------- edit ---------- */
    const handleEditProject = (p) => {
        setNewProject({ ...p, type: "", authors: "" });
        setTypeList(p.type || []);
        setAuthorList(p.authors || []);
        setIsEditing(true);
    };

    /* ---------- static options ---------- */
    const typesOptions = [
        "口頭発表",
        "デモポスター",
        "フルペーパー",
        "一般",
        "学内発表",
    ];

    /* ========================================================= render */
    if (!isAuthenticated)
        return (
            <div className="d-flex align-items-center justify-content-center bg-gradient">
                <div className="card shadow-sm p-4" style={{ minWidth: 300 }}>
                    <h5 className="card-title mb-3">Password Protected</h5>
                    <p className="text-muted small mb-2">
                        Enter the password to access this component:
                    </p>
                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="btn btn-primary w-100"
                        onClick={() =>
                            password === "Kame-2002"
                                ? setIsAuthenticated(true)
                                : alert("Incorrect password!")
                        }
                    >
                        Submit
                    </button>
                </div>
            </div>
        );

    return (
        <div className="bg-light bg-gradient min-vh-100 py-4">
            <div className="container-lg">
                <h1 className="h3 fw-bold mb-4">
                    プロジェクト管理画面
                    <small className="text-muted fs-6 ms-2">ver {packageInfo.version}</small>
                </h1>

                {/* ───── Project Form ───── */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-primary text-white">
                        {isEditing ? "Edit Project" : "新規作成"}
                    </div>
                    <div className="card-body">
                        {/* Category */}
                        <div className="mb-3">
                            <label className="form-label">カテゴリ</label>
                            <select
                                className="form-select"
                                value={newProject.category}
                                onChange={(e) =>
                                    setNewProject({ ...newProject, category: e.target.value })
                                }
                            >
                                <option value="">Select Category</option>
                                <option value="academic">Academic</option>
                                <option value="product">Product</option>
                            </select>
                        </div>

                        {/* ID */}
                        <div className="mb-3">
                            <label className="form-label">プロジェクト固有名</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="project-url"
                                value={newProject.id}
                                onChange={(e) =>
                                    setNewProject({ ...newProject, id: e.target.value })
                                }
                                disabled={isEditing}
                            />
                        </div>

                        {/* Type checkboxes */}
                        <div className="mb-3">
                            <label className="form-label">形式</label>
                            <div>
                                {typesOptions.map((t) => (
                                    <div className="form-check form-check-inline" key={t}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`type-${t}`}
                                            checked={typeList.includes(t)}
                                            onChange={(e) =>
                                                e.target.checked
                                                    ? setTypeList([...typeList, t])
                                                    : setTypeList(typeList.filter((v) => v !== t))
                                            }
                                        />
                                        <label
                                            className="form-check-label small"
                                            htmlFor={`type-${t}`}
                                        >
                                            {t}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Basic fields */}
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="タイトル"
                            value={newProject.title}
                            onChange={(e) =>
                                setNewProject({ ...newProject, title: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="サブタイトル"
                            value={newProject.subtitle}
                            onChange={(e) =>
                                setNewProject({ ...newProject, subtitle: e.target.value })
                            }
                        />
                        <textarea
                            className="form-control mb-2"
                            placeholder="説明"
                            value={newProject.description}
                            onChange={(e) =>
                                setNewProject({ ...newProject, description: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="開催場所"
                            value={newProject.location}
                            onChange={(e) =>
                                setNewProject({ ...newProject, location: e.target.value })
                            }
                        />
                        <input
                            type="date"
                            className="form-control mb-3"
                            value={newProject.date}
                            onChange={(e) =>
                                setNewProject({ ...newProject, date: e.target.value })
                            }
                        />

                        {/* Authors */}
                        <div className="mb-3">
                            <label className="form-label d-block">著者</label>
                            <div className="input-group mb-2">
                                <input
                                    className="form-control"
                                    value={authorInput}
                                    onChange={(e) => setAuthorInput(e.target.value)}
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => {
                                        const trimmed = authorInput.trim();
                                        if (trimmed && !authorList.includes(trimmed)) {
                                            setAuthorList([...authorList, trimmed]);
                                            setAuthorInput("");
                                        }
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                            {authorList.map((a) => (
                                <span
                                    key={a}
                                    className="badge bg-secondary me-2 mb-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        setAuthorList(authorList.filter((v) => v !== a))
                                    }
                                >
                                    {a} &times;
                                </span>
                            ))}
                        </div>

                        {/* Media */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label">メイン画像</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => setMainImageFile(e.target.files[0])}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">動画ファイル</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    multiple
                                    onChange={(e) => setVideoFiles(Array.from(e.target.files))}
                                />
                            </div>
                        </div>

                        {/* Academic only */}
                        {isAcademic && (
                            <>
                                <hr />
                                <h6 className="text-primary mb-3">論文情報</h6>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Journal Name"
                                    value={newProject.journal.name}
                                    onChange={(e) =>
                                        setNewProject({
                                            ...newProject,
                                            journal: { ...newProject.journal, name: e.target.value },
                                        })
                                    }
                                />
                                <div className="row g-2 mb-2">
                                    <div className="col-md">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Volume"
                                            value={newProject.journal.volume}
                                            onChange={(e) =>
                                                setNewProject({
                                                    ...newProject,
                                                    journal: {
                                                        ...newProject.journal,
                                                        volume: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Number"
                                            value={newProject.journal.number}
                                            onChange={(e) =>
                                                setNewProject({
                                                    ...newProject,
                                                    journal: {
                                                        ...newProject.journal,
                                                        number: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Pages"
                                            value={newProject.journal.pages}
                                            onChange={(e) =>
                                                setNewProject({
                                                    ...newProject,
                                                    journal: {
                                                        ...newProject.journal,
                                                        pages: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Paper URL"
                                    value={newProject.sourceUrl}
                                    onChange={(e) =>
                                        setNewProject({ ...newProject, sourceUrl: e.target.value })
                                    }
                                />
                            </>
                        )}

                        {/* Award & URL */}
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Award Title"
                            value={newProject.award}
                            onChange={(e) =>
                                setNewProject({ ...newProject, award: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            className="form-control mb-4"
                            placeholder="Related URL"
                            value={newProject.url}
                            onChange={(e) =>
                                setNewProject({ ...newProject, url: e.target.value })
                            }
                        />

                        {/* Actions */}
                        <button className="btn btn-primary me-2" onClick={handleSaveProject}>
                            {isEditing ? "Update" : "Add"}
                        </button>
                        <button className="btn btn-outline-secondary" onClick={resetForm}>
                            Reset
                        </button>
                    </div>
                </div>

                {/* ───── Upload Progress ───── */}
                {uploadProgress.length > 0 && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-info text-white">Upload Progress</div>
                        <div className="card-body">
                            {uploadProgress.map((f) => (
                                <div key={f.name} className="mb-3">
                                    <small className="d-block mb-1">{f.name}</small>
                                    <div className="progress">
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ width: `${f.progress}%` }}
                                            aria-valuenow={f.progress}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                            {f.progress}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ───── Project List ───── */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-secondary text-white">
                        Project List
                    </div>
                    <div className="list-group list-group-flush">
                        {projects.map((p) => (
                            <div
                                key={p.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>{p.title}</span>
                                <span>
                                    <button
                                        className="btn btn-sm btn-outline-warning me-2"
                                        onClick={() => handleEditProject(p)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteProject(p.id)}
                                    >
                                        Delete
                                    </button>
                                </span>
                            </div>
                        ))}
                        {projects.length === 0 && (
                            <div className="list-group-item text-muted small">
                                No projects yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* ───── Delete Progress ───── */}
                {deleteProgress > 0 && (
                    <div className="card shadow-sm">
                        <div className="card-header bg-danger text-white">
                            Deleting Project: {deleteProgress}%
                        </div>
                        <div className="card-body">
                            <div className="progress">
                                <div
                                    className="progress-bar bg-danger"
                                    style={{ width: `${deleteProgress}%` }}
                                    role="progressbar"
                                    aria-valuenow={deleteProgress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {deleteProgress}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectManager;
