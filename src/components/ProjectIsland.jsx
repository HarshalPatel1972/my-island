// src/components/ProjectIsland.jsx

function ProjectIsland({ id, project }) {
  return (
    <div
      id={id}
      className="island project-island"
      style={{
        top: project.position.top,
        left: project.position.left,
      }}
    >
      <img
        src={project.imageSrc}
        alt={project.title}
        className="project-image"
      />

      <div className="project-title-bar">
        <h3>{project.title}</h3>
      </div>
    </div>
  );
}

export default ProjectIsland;
