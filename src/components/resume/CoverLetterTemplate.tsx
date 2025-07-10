import React from 'react';
import { CoverLetterData } from '../../store/resumeBuilderSlice';

interface CoverLetterTemplateProps {
  data: CoverLetterData;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
}

const CoverLetterTemplate: React.FC<CoverLetterTemplateProps> = ({ data, personalInfo }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg print:shadow-none print:p-0">
      {/* Header */}
      <header className="mb-8">
        <div className="text-right mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{personalInfo.name}</h1>
          <div className="text-gray-600">
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">{currentDate}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-900 font-semibold">Hiring Manager</p>
          <p className="text-gray-900">{data.jobDetails.company}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-900">
            <strong>Re: Application for {data.jobDetails.position}</strong>
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-6 text-gray-700 leading-relaxed">
        {/* Opening */}
        <p>{data.sections.opening}</p>

        {/* Body paragraphs */}
        {data.sections.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        {/* Closing */}
        <p>{data.sections.closing}</p>

        {/* Signature */}
        <div className="mt-8">
          <p>Sincerely,</p>
          <div className="mt-6">
            <p className="font-semibold">{personalInfo.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterTemplate;