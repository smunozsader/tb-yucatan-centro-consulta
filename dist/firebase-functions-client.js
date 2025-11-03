/**
 * Firebase Functions Client - Gen 2 Functions Integration
 * 
 * This module provides client-side integration with Firebase Cloud Functions Gen 2.
 * All functions are deployed on Cloud Run for improved performance and scaling.
 * 
 * Gen 2 Functions Benefits:
 * - Up to 100% faster cold starts
 * - 1000x improved concurrency (up to 1000 concurrent requests per instance)
 * - Better cost optimization with pay-per-use model
 * - Enhanced logging and monitoring capabilities
 * - Modern Cloud Run infrastructure
 * 
 * @version 2.0.0 - Gen 2 Migration Complete
 * @author Centro de Consulta de Acuerdos Sanitarios
 * @date November 2025
 */

class FirebaseFunctionsClient {
  constructor() {
    // Gen 2 Cloud Run function URLs
    this.functions = {
      adminUploadV2: 'https://adminuploadv2-lwzj3v5uga-uc.a.run.app',
      setCustomUserRoleV2: 'https://setcustomuserrolev2-lwzj3v5uga-uc.a.run.app'
    };
    
    // Default configuration
    this.config = {
      timeout: 30000, // 30 seconds timeout
      retries: 3,
      retryDelay: 1000 // 1 second
    };
    
    console.log('🚀 Firebase Functions Client initialized (Gen 2)');
    console.log('📊 Cloud Run Functions:', Object.keys(this.functions));
  }

  /**
   * Upload agreements batch file to Firebase
   * @param {File} file - CSV file with agreements
   * @param {string} organization - 'CESO' or 'APHIS'
   * @param {string} apiKey - Admin API key
   * @param {Function} progressCallback - Progress updates
   * @returns {Promise<Object>} Upload result
   */
  async uploadAgreementsBatch(file, organization, apiKey, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organization', organization);
      formData.append('apiKey', apiKey);

      if (progressCallback) {
        progressCallback({ status: 'uploading', progress: 10, message: 'Conectando al servidor...' });
      }

      const response = await this._makeRequest(this.functions.adminUploadV2, {
        method: 'POST',
        body: formData
      });

      if (progressCallback) {
        progressCallback({ status: 'processing', progress: 70, message: 'Procesando archivo...' });
      }

      const result = await response.json();

      if (progressCallback) {
        progressCallback({ status: 'completed', progress: 100, message: '¡Completado!' });
      }

      return {
        success: true,
        data: result,
        message: 'Archivo procesado exitosamente'
      };

    } catch (error) {
      console.error('Error en uploadAgreementsBatch:', error);
      
      if (progressCallback) {
        progressCallback({ status: 'error', progress: 0, message: 'Error en la carga' });
      }

      return {
        success: false,
        error: error.message,
        message: `Error al cargar archivo: ${error.message}`
      };
    }
  }

  /**
   * Set custom user role using callable function
   * @param {string} email - User email
   * @param {string} role - User role (PUBLIC, RESPONSIBLE, ADMINISTRATOR)
   * @returns {Promise<Object>} Operation result
   */
  async setUserRole(email, role) {
    try {
      console.log(`🔐 Setting user role: ${email} -> ${role}`);

      // For callable functions, we need to use the Firebase SDK
      if (typeof firebase !== 'undefined' && firebase.functions) {
        const setCustomUserRoleV2 = firebase.functions().httpsCallable('setCustomUserRoleV2');
        const result = await setCustomUserRoleV2({ email, role });
        
        return {
          success: true,
          data: result.data,
          message: `Rol de usuario actualizado: ${email} -> ${role}`
        };
      } else {
        // Fallback for environments without Firebase SDK
        const response = await this._makeRequest(this.functions.setCustomUserRoleV2, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: { email, role }
          })
        });

        const result = await response.json();
        
        return {
          success: true,
          data: result,
          message: `Rol de usuario actualizado: ${email} -> ${role}`
        };
      }

    } catch (error) {
      console.error('Error en setUserRole:', error);
      
      return {
        success: false,
        error: error.message,
        message: `Error al actualizar rol: ${error.message}`
      };
    }
  }

  /**
   * Test connection to Gen 2 functions
   * @returns {Promise<Object>} Test results
   */
  async testConnection() {
    const results = {
      adminUploadV2: false,
      setCustomUserRoleV2: false,
      overall: false
    };

    try {
      // Test adminUploadV2 with OPTIONS request
      const uploadResponse = await fetch(this.functions.adminUploadV2, {
        method: 'OPTIONS'
      });
      results.adminUploadV2 = uploadResponse.ok;

      // Test setCustomUserRoleV2
      const roleResponse = await fetch(this.functions.setCustomUserRoleV2, {
        method: 'OPTIONS'
      });
      results.setCustomUserRoleV2 = roleResponse.ok;

      results.overall = results.adminUploadV2 && results.setCustomUserRoleV2;
      
      console.log('🔍 Gen 2 Functions connectivity test:', results);
      
      return {
        success: results.overall,
        data: results,
        message: results.overall ? 
          'Todas las funciones Gen 2 están disponibles' : 
          'Algunas funciones Gen 2 no están disponibles'
      };

    } catch (error) {
      console.error('Error en test de conectividad:', error);
      
      return {
        success: false,
        error: error.message,
        message: `Error en test de conectividad: ${error.message}`
      };
    }
  }

  /**
   * Get function URLs and status information
   * @returns {Object} Function information
   */
  getFunctionInfo() {
    return {
      functions: this.functions,
      generation: 2,
      runtime: 'Cloud Run',
      region: 'us-central1',
      features: [
        'Up to 100% faster cold starts',
        '1000x improved concurrency',
        'Enhanced autoscaling',
        'Better cost optimization',
        'Modern infrastructure'
      ],
      migrationDate: 'November 2025',
      documentation: 'See .github/copilot-instructions-new.md for full details'
    };
  }

  /**
   * Internal method to make HTTP requests with retries and error handling
   * @private
   */
  async _makeRequest(url, options, retryCount = 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      if (retryCount < this.config.retries && !error.name === 'AbortError') {
        console.warn(`Reintentar solicitud ${retryCount + 1}/${this.config.retries}:`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (retryCount + 1)));
        return this._makeRequest(url, options, retryCount + 1);
      }

      throw error;
    }
  }
}

// Global instance
window.FirebaseFunctionsClient = FirebaseFunctionsClient;
window.firebaseFunctionsClient = new FirebaseFunctionsClient();

// Auto-initialize test on load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    const testResult = await window.firebaseFunctionsClient.testConnection();
    if (testResult.success) {
      console.log('✅ Gen 2 Functions ready for use');
    } else {
      console.warn('⚠️ Some Gen 2 Functions may not be available');
    }
  });
}

console.log('📦 Firebase Functions Client (Gen 2) loaded successfully');