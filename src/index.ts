import { ApplicationService } from './core/application-service';

const app = new ApplicationService();

app.initialize()
  .then(() => {
    console.log('Application initialized successfully');
  })
  .catch(error => {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  });