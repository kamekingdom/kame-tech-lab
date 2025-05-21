import { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc
} from "firebase/firestore";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
} from "firebase/storage";
import "bootstrap/dist/css/bootstrap.min.css";
import packageInfo from "../../package.json";

const ProjectManager = () => {
    // パスワード関連の状態
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
        journal: {
            name: "",
            volume: "",
            number: "",
            pages: "",
        },
        authors: "",
        award: "",
        url: "",
        sourceUrl: "",
        target_url: "",
        category: "", // カテゴリを追加
    });

    const [mainImageFile, setMainImageFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [typeList, setTypeList] = useState([]); // タイプリスト
    const [authorInput, setAuthorInput] = useState(""); // 著者入力用
    const [authorList, setAuthorList] = useState([]); // 著者リスト


    // Fetch projects from Firestore
    const fetchProjects = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "projects"));
            const projectList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProjects(projectList);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Upload files with progress tracking
    const uploadFileWithProgress = (file, path) => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress((prev) => [
                        ...prev.filter((item) => item.name !== file.name),
                        { name: file.name, progress: Math.round(progress) },
                    ]);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    // Save project (add or update)
    const handleSaveProject = async () => {
        try {
            if (!newProject.id) {
                alert("Project ID is required!");
                return;
            }

            // メイン画像のアップロード
            const mainImageUrl = mainImageFile
                ? await uploadFileWithProgress(
                    mainImageFile,
                    `projects/${newProject.id}/main_image`
                )
                : newProject.main_image;

            // 追加画像のアップロード
            const imageUrls = [];
            for (const file of imageFiles) {
                const imageUrl = await uploadFileWithProgress(
                    file,
                    `projects/${newProject.id}/images/${file.name}`
                );
                imageUrls.push(imageUrl);
            }

            // 動画のアップロード
            const videoUrls = [];
            for (const file of videoFiles) {
                const videoUrl = await uploadFileWithProgress(
                    file,
                    `projects/${newProject.id}/videos/${file.name}`
                );
                videoUrls.push(videoUrl);
            }

            // プロジェクトデータの準備
            // const projectTypes = newProject.type.split(",").map((type) => type.trim());
            const projectData = {
                ...newProject,
                type: typeList,
                authors: authorList,
                main_image: mainImageUrl,
                images: imageUrls.length > 0 ? imageUrls : newProject.images || [],
                videos: videoUrls.length > 0 ? videoUrls : newProject.videos || [],
                category: newProject.category, // カテゴリを保存
            };


            const projectRef = doc(db, "projects", newProject.id);
            await setDoc(projectRef, projectData); // Firebaseに保存
            alert(isEditing ? "Project updated successfully!" : "Project added successfully!");

            resetForm();
            fetchProjects();
        } catch (error) {
            console.error("Error saving project:", error);
        }
    };

    // 種類のオプション
    const typesOptions = [
        "口頭発表",
        "デモポスター",
        "フルペーパー",
        "一般",
        "学内発表",
    ];


    // Reset form
    const resetForm = () => {
        setNewProject({
            id: "",
            type: "",
            title: "",
            subtitle: "",
            description: "",
            location: "",
            date: "",
            journal: {
                name: "",
                volume: "",
                number: "",
                pages: "",
            },
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

    // 再帰的にストレージ内のファイルを削除する関数
    const deleteFolderContents = async (folderRef) => {
        const list = await listAll(folderRef);
        for (const item of list.items) {
            await deleteObject(item); // 各ファイルを削除
        }
        for (const prefix of list.prefixes) {
            // サブフォルダも再帰的に削除
            await deleteFolderContents(prefix);
        }
    };


    // Delete project
    const handleDeleteProject = async (projectId) => {
        try {
            setDeleteProgress(0); // 初期化
            const projectRef = doc(db, "projects", projectId);
            await deleteDoc(projectRef);

            // ストレージ内の関連ファイルを削除
            const projectFolderRef = ref(storage, `projects/${projectId}`);
            await deleteFolderContents(projectFolderRef); // 再帰的に削除
            alert("Project deleted successfully!");
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
        } finally {
            setDeleteProgress(0); // 完了後リセット
        }
    };

    // Load project for editing
    const handleEditProject = (project) => {
        setNewProject({
            ...project,
            type: "", // リストに変更されたため空にする
            authors: "", // リストに変更されたため空にする
        });
        setTypeList(project.type || []); // リストに設定
        setAuthorList(project.authors || []); // リストに設定
        setIsEditing(true);
    };

    // パスワード認証フォーム
    if (!isAuthenticated) {
        return (
            <div className="container py-5">
                <h1 className="mb-4">Password Protected</h1>
                <p>Enter the password to access this component:</p>
                <input
                    type="password"
                    className="form-control mb-2"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        if (password === "Kame-2002") {
                            setIsAuthenticated(true);
                        } else {
                            alert("Incorrect password!");
                        }
                    }}
                >
                    Submit
                </button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">プロジェクト管理画面(ver {packageInfo.version})</h1>

            {/* Project Form */}
            <div className="mb-4">
                <h3>{isEditing ? "Edit Project" : "新規作成"}</h3>
                <label className="form-label">カテゴリ</label>
                <select
                    className="form-select mb-2"
                    value={newProject.category}
                    onChange={(e) =>
                        setNewProject({ ...newProject, category: e.target.value })
                    }
                >
                    <option value="">Select Category</option>
                    <option value="academic">Academic</option>
                    <option value="product">Product</option>
                </select>

                <label className="form-label">プロジェクト固有名</label>
                <input
                    type="text"
                    placeholder="project-url"
                    className="form-control mb-2"
                    value={newProject.id}
                    onChange={(e) => setNewProject({ ...newProject, id: e.target.value })}
                    disabled={isEditing}
                />

                {/* Type 入力欄 */}
                <div className="mb-4">
                    <label className="form-label">形式</label>
                    <div>
                        {typesOptions.map((type) => (
                            <div key={type} className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`type-${type}`}
                                    value={type}
                                    checked={typeList.includes(type)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setTypeList([...typeList, type]);
                                        } else {
                                            setTypeList(typeList.filter((t) => t !== type));
                                        }
                                    }}
                                />
                                <label className="form-check-label" htmlFor={`type-${type}`}>
                                    {type}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>



                <input
                    type="text"
                    placeholder="タイトル"
                    className="form-control mb-2"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="サブタイトル"
                    className="form-control mb-2"
                    value={newProject.subtitle}
                    onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
                />
                <textarea
                    placeholder="説明"
                    className="form-control mb-2"
                    value={newProject.description}
                    onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                    }
                />
                <input
                    type="text"
                    placeholder="開催場所"
                    className="form-control mb-2"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                />
                <input
                    type="date"
                    className="form-control mb-2"
                    value={newProject.date}
                    onChange={(e) => setNewProject({ ...newProject, date: e.target.value })}
                />

                {/* Authors 入力欄 */}
                <div className="mb-4">
                    <label>著者</label>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={authorInput}
                            onChange={(e) => setAuthorInput(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                if (authorInput.trim() && !authorList.includes(authorInput.trim())) {
                                    setAuthorList([...authorList, authorInput.trim()]);
                                    setAuthorInput(""); // 入力フィールドをリセット
                                }
                            }}
                        >
                            Add Author
                        </button>
                    </div>
                    <div className="mt-2">
                        {authorList.map((author, index) => (
                            <span
                                key={index}
                                className="badge bg-secondary me-2"
                                onClick={() =>
                                    setAuthorList(authorList.filter((a) => a !== author))
                                }
                                style={{ cursor: "pointer" }}
                            >
                                {author} &times;
                            </span>
                        ))}
                    </div>
                </div>
                <label className="form-label">画像</label>
                <input
                    type="file"
                    className="form-control mb-2"
                    onChange={(e) => setMainImageFile(e.target.files[0])}
                />
                {/* <label className="form-label">Additional Images</label>
                <input
                    type="file"
                    multiple
                    className="form-control mb-2"
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                /> */}
                <label className="form-label">動画</label>
                <input
                    type="file"
                    multiple
                    className="form-control mb-2"
                    onChange={(e) => setVideoFiles(Array.from(e.target.files))}
                />

            </div>
            {/* Journal Information */}
            <div className="mb-4">
                <h5>論文情報</h5>
                <input
                    type="text"
                    placeholder="Journal Name"
                    className="form-control mb-2"
                    value={newProject.journal.name}
                    onChange={(e) =>
                        setNewProject({
                            ...newProject,
                            journal: { ...newProject.journal, name: e.target.value },
                        })
                    }
                />
                <input
                    type="text"
                    placeholder="Volume"
                    className="form-control mb-2"
                    value={newProject.journal.volume}
                    onChange={(e) =>
                        setNewProject({
                            ...newProject,
                            journal: { ...newProject.journal, volume: e.target.value },
                        })
                    }
                />
                <input
                    type="text"
                    placeholder="Number"
                    className="form-control mb-2"
                    value={newProject.journal.number}
                    onChange={(e) =>
                        setNewProject({
                            ...newProject,
                            journal: { ...newProject.journal, number: e.target.value },
                        })
                    }
                />
                <input
                    type="text"
                    placeholder="Pages"
                    className="form-control mb-2"
                    value={newProject.journal.pages}
                    onChange={(e) =>
                        setNewProject({
                            ...newProject,
                            journal: { ...newProject.journal, pages: e.target.value },
                        })
                    }
                />
            </div>

            {/* Award */}
            <div className="mb-4">
                <label>賞</label>
                <input
                    type="text"
                    placeholder="Award Title"
                    className="form-control mb-2"
                    value={newProject.award}
                    onChange={(e) => setNewProject({ ...newProject, award: e.target.value })}
                />
            </div>

            {/* URLs */}
            <div className="mb-4">
                <label>論文URL</label>
                <input
                    type="text"
                    placeholder="Paper URL"
                    className="form-control mb-2"
                    value={newProject.sourceUrl}
                    onChange={(e) => setNewProject({ ...newProject, sourceUrl: e.target.value })}
                />
                <label>関連URL</label>
                <input
                    type="text"
                    placeholder="Related URL"
                    className="form-control mb-2"
                    value={newProject.url}
                    onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                />
            </div>

            <button className="btn btn-primary" onClick={handleSaveProject}>
                {isEditing ? "Update Project" : "Add Project"}
            </button>
            <button className="btn btn-secondary ms-2" onClick={resetForm}>
                Reset
            </button>


            {/* Upload Progress */}
            <div>
                {uploadProgress.map((file) => (
                    <div key={file.name} className="mb-2">
                        <p>{file.name}</p>
                        <div className="progress">
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${file.progress}%` }}
                                aria-valuenow={file.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {file.progress}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Project List */}
            <h3>Project List</h3>
            {projects.map((project) => (
                <div key={project.id} className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{project.title}</h5>
                        <button
                            className="btn btn-warning me-2"
                            onClick={() => handleEditProject(project)}
                        >
                            Edit
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteProject(project.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
            {deleteProgress > 0 && (
                <div className="mb-4">
                    <p>Deleting Project: {deleteProgress}%</p>
                    <div className="progress">
                        <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${deleteProgress}%` }}
                            aria-valuenow={deleteProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        >
                            {deleteProgress}%
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectManager;
