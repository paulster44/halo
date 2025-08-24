# HALO - Home Automation Layout Optimization

A powerful React-based application for analyzing architectural floorplans and generating optimized device placement layouts with installation guidance.

## 🚀 Features

- **Floorplan Upload & Analysis**: Upload architectural floorplans in various image formats
- **AI-Powered Device Placement**: Automatically analyze and suggest optimal device placements
- **Interactive Visualization**: View device placements overlaid on original floorplans
- **Rack Diagram Generation**: Generate detailed rack diagrams with installation instructions
- **User Authentication**: Secure user registration and login system
- **Project Management**: Organize and manage multiple floorplan analysis projects
- **Responsive Design**: Fully responsive interface optimized for desktop and mobile

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for responsive styling
- **React Router** for client-side routing
- **Context API** for state management

### Backend & Infrastructure
- **Supabase** for backend-as-a-service
  - PostgreSQL database
  - Authentication system
  - Edge Functions (Deno runtime)
  - File storage
- **Deno** for serverless functions

### Database Schema
- `profiles` - User profile information
- `projects` - Floorplan analysis projects
- `device_categories` - Device type classifications
- `device_specifications` - Technical device specifications
- `device_placements` - Calculated device positions
- `equipment_racks` - Rack configuration data

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** package manager
- **Supabase Account** (free tier available)
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/paulster44/halo.git
cd halo
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

### 3. Environment Configuration

Create environment files in the project root:

#### `.env.local` (for local development)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### `.env` (for production builds)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

#### Database Schema

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Execute the following schema creation script:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  floorplan_url TEXT,
  analysis_result JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create device_categories table
CREATE TABLE device_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create device_specifications table
CREATE TABLE device_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES device_categories(id),
  name TEXT NOT NULL,
  specifications JSONB,
  dimensions JSONB,
  power_requirements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create device_placements table
CREATE TABLE device_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  device_spec_id UUID REFERENCES device_specifications(id),
  position JSONB,
  rotation FLOAT DEFAULT 0,
  installation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create equipment_racks table
CREATE TABLE equipment_racks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  rack_configuration JSONB,
  installation_diagram_url TEXT,
  installation_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_racks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view and edit their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage placements for their projects" ON device_placements
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM projects WHERE projects.id = device_placements.project_id
  ));

CREATE POLICY "Users can manage racks for their projects" ON equipment_racks
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM projects WHERE projects.id = equipment_racks.project_id
  ));

-- Allow public read access to device categories and specifications
CREATE POLICY "Public read access to device categories" ON device_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access to device specifications" ON device_specifications
  FOR SELECT USING (true);
```

#### Storage Bucket Setup

1. Navigate to Storage in your Supabase dashboard
2. Create a new bucket named `floorplans`
3. Set the bucket to public access
4. Configure the following policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload floorplans" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'floorplans' AND auth.role() = 'authenticated');

-- Allow public read access to floorplan files
CREATE POLICY "Public access to floorplan files" ON storage.objects
  FOR SELECT USING (bucket_id = 'floorplans');
```

### 5. Deploy Supabase Edge Functions

#### Install Supabase CLI

```bash
npm install -g supabase
```

#### Login and Link Project

```bash
supabase login
supabase link --project-ref your_project_reference
```

#### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy floorplan-analysis
supabase functions deploy generate-rack-diagram
```

### 6. Development Server

```bash
# Start development server
npm run dev

# Or with pnpm
pnpm dev
```

The application will be available at `http://localhost:5173`

## 🚀 Deployment

### Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Production

The application can be deployed to various platforms:

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### Railway
```bash
# Connect GitHub repository to Railway
# Set environment variables in Railway dashboard
```

## 📁 Project Structure

```
halo/
├── public/
│   ├── images/           # Static image assets
│   └── data/            # Static data files
├── src/
│   ├── components/      # React components
│   │   ├── auth/       # Authentication components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── floorplan/  # Floorplan analysis components
│   │   └── ui/         # Reusable UI components
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Database migrations
├── .env.example        # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

### Finding Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → API
4. Copy the "Project URL" and "anon public" key

## 🎯 Usage

### User Registration & Authentication

1. Navigate to the application
2. Click "Sign Up" to create a new account
3. Provide email, password, and full name
4. Verify your email address
5. Sign in to access the dashboard

### Floorplan Analysis Workflow

1. **Upload Floorplan**
   - Click "New Project" from the dashboard
   - Upload an image file (JPG, PNG, WEBP)
   - Provide project name and description

2. **Start Analysis**
   - Click "Start Analysis" to process the floorplan
   - The system will analyze the layout and suggest device placements

3. **Review Results**
   - View the analyzed floorplan with device overlays
   - Review suggested device placements
   - Access generated rack diagrams

4. **Export Results**
   - Download rack diagrams
   - Export installation instructions
   - Save project for future reference

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
- Verify Supabase URL and keys in environment variables
- Check if Supabase project is active
- Ensure RLS policies are properly configured

#### Authentication Errors
- Verify email confirmation is enabled in Supabase Auth settings
- Check SMTP configuration for email delivery
- Ensure user metadata is properly formatted

#### Edge Function Errors
- Verify Edge Functions are deployed successfully
- Check function logs in Supabase dashboard
- Ensure proper CORS configuration

#### File Upload Issues
- Verify storage bucket permissions
- Check file size limits
- Ensure bucket is set to public access

### Debug Mode

Enable debug logging by setting:
```env
VITE_DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting with Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Powered by [Supabase](https://supabase.com/) backend infrastructure
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Bundled with [Vite](https://vitejs.dev/)

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the [troubleshooting section](#-troubleshooting)
- Review [Supabase documentation](https://supabase.com/docs)

---

**Made with ❤️ for efficient floorplan analysis and device placement optimization**
