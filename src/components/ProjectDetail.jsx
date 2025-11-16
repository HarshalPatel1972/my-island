// src/components/ProjectDetail.jsx

function ProjectDetail({ project, onClose }) {
  return (
    <div className="project-detail-overlay">
      <div className="project-detail-content">
        
        <button className="detail-close-button" onClick={onClose}>
          ✕
        </button>

        <h1>{project.title}</h1>

        <img 
          src={project.imageSrc} 
          alt={project.title} 
          className="detail-image" 
        />

        <p className="detail-description">
          {project.description}
        </p>
      </div>
    </div>
  );
}

export default ProjectDetail;
