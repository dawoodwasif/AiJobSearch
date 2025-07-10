import React from 'react';
import { ResumeData } from '../../store/resumeBuilderSlice';

interface ResumeTemplateProps {
  data: ResumeData;
  template: string;
}

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data, template }) => {
  const { personalInfo, experience, education, skills, projects, certifications } = data;

  if (template === 'modern') {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg print:shadow-none print:p-0">
        {/* Header */}
        <header className="border-b-2 border-blue-600 pb-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{personalInfo.name}</h1>
          <h2 className="text-xl text-blue-600 font-semibold mb-4">{personalInfo.title}</h2>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.location}</span>
          </div>
        </header>

        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">
              Professional Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
              Professional Experience
            </h3>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-gray-600 text-sm">{exp.duration}</span>
                </div>
                <p className="text-gray-700 mb-2">{exp.description}</p>
                {exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 ml-4">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-blue-600">{edu.institution}</p>
                  </div>
                  <span className="text-gray-600 text-sm">{edu.year}</span>
                </div>
                {edu.gpa && <p className="text-gray-700">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
            Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skills.technical.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.technical.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.soft.map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tools & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((tool, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
              Projects
            </h3>
            {projects.map((project) => (
              <div key={project.id} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  {project.url && (
                    <a href={project.url} className="text-blue-600 text-sm hover:underline">
                      View Project
                    </a>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
              Certifications
            </h3>
            <ul className="list-disc list-inside text-gray-700">
              {certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // Add more templates here (professional, creative, etc.)
  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <p>Template "{template}" not implemented yet.</p>
    </div>
  );
};

export default ResumeTemplate;