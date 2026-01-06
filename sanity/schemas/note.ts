import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'note',
  title: 'Note',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subjectId',
      title: 'Subject',
      type: 'reference',
      to: [{ type: 'subject' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fileName',
      title: 'File Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fileType',
      title: 'File Type',
      type: 'string',
      options: {
        list: [
          { title: 'PDF', value: 'pdf' },
          { title: 'Text', value: 'txt' },
          { title: 'Word Document', value: 'docx' },
          { title: 'Markdown', value: 'md' },
          { title: 'Image', value: 'image' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'Extracted text content from the file',
    }),
    defineField({
      name: 'fileSize',
      title: 'File Size (bytes)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'uploadDate',
      title: 'Upload Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
