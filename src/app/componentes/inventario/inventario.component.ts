import { Component, OnInit } from '@angular/core';
//1.-agregamos imports necesarios (formularios )
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from 'src/app/services/firebase.service';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})

export class InventarioComponent implements OnInit {

  //2.-creamos algunas variables de control
  closeResult = '';

  prodForm: FormGroup;
  idFirebaseUpdate: string;
  updSave: boolean;

  //3.- inyectamos modulos y servicio de firebase 
  constructor(
    public fb: FormBuilder,
    private modalService: NgbModal,
    private firebaseService: FirebaseService) { }
    
  //5.-Creamos un arreglo el cual guardara toda la informacion de los elementos que almacenemos en firebase
  collection = { data: [] };


  ngOnInit(): void {
    //creamos una variable la cual guardara el id generado por firebase
    this.idFirebaseUpdate = "";

    //creamos la estructura de nuestro formulario 
    this.prodForm = this.fb.group({
      marca: ['', Validators.required],
      color: ['', Validators.required],
      talla: ['', Validators.required],
      existencia: ['', Validators.required],
      precio: ['', Validators.required]
    });

    //creamos un observador para poder consultar la base de datos de firebase
    this.firebaseService.getProductos().subscribe(
      resp => {
        this.collection.data = resp.map((e: any) => {
          return {
            marca: e.payload.doc.data().marca,
            color: e.payload.doc.data().color,
            talla: e.payload.doc.data().talla,
            existencia: e.payload.doc.data().existencia,
            precio: e.payload.doc.data().precio,
            idFirebase: e.payload.doc.id
          }
        })
      },
      error => {
        console.error(error);
      }
    );
  }//

  //creamoas el metodo que controla la vista de la tabla

  //creamos el metodo de eliminar de la base de datos de firebase
  eliminar(item: any): void {
    this.firebaseService.eliminarProducto(item.idFirebase)
    //eliminamos el elemento con el id de firebase el cual guardamos en la variable idFirebase
  };

  //metodo que guarda los datos de producto en firebase
  guardar(): void {
    //creamos una promesa la cual si se cumple cerrara el cuadro de dialogo
    this.firebaseService.createProducto(this.prodForm.value).
      then(resp => {
        this.prodForm.reset();
        this.modalService.dismissAll();
      })
      .catch(error => {
        console.error(error);

      })

  };

  //metodo para actualizar los datos de un producto en especifico
  actualizar() {
    if (!isNullOrUndefined(this.idFirebaseUpdate)) {
      //creamos prokmesa que reseteara el cuadro de dialogo
      this.firebaseService.updateProducto(this.idFirebaseUpdate, this.prodForm.value).then(resp => {
        this.prodForm.reset();
        this.modalService.dismissAll();
      })
        .catch(error => {
          console.error(error);

        });
    }
  }

  //esto es codigo del modal para habilitar edicion
  editarProducto(content, item: any) {
    this.updSave = true;
    //llenando formulario con los datos a editar
    this.prodForm.setValue({
      marca: item.marca,
      color: item.color,
      talla: item.talla,
      existencia: item.existencia,
      precio: item.precio
    });
    //guardamos el id de firebase para poder actualizar los datos nuevos
    this.idFirebaseUpdate = item.idFirebase;

    //*codigo de plantilla de modal*//
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  //abrimos el modal (formulario) para llenar os datos
  nuevoProducto(content) {
    this.updSave = false;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
